/**
 * Create Anki CSV and download audio for IC Pronunciation
 * Assumes slow audio is duplicate of fast, discards it
 */

import { log } from "../logger.ts";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { join, parse as parsePath } from "@std/path";
import { delay } from "@std/async";
import { exists } from "@std/fs";
import { downloadFile } from "../utilities.ts";
import type { Data, Exercise, Pronunciation, Pronunciations } from "./types.ts";

const DOWNLOAD_DELAY = 1000;
export const COLUMNS_INPUT = [
  "web-scraper-order",
  "web-scraper-start-url",
  "lesson",
  "lesson-href",
  "pinyin",
  "description",
  "audioFastUrl",
  "audioSlowUrl",
  "identifier",
] as const;
export const COLUMNS_OUTPUT = [
  "identifier",
  "pinyin",
  "description",
  "audio",
] as const;

const [SOURCE_CSV, TARGET_CSV_DIR, TARGET_AUDIO_DIR] = Deno.args;

if (!SOURCE_CSV) {
  throw new Error("No source file specified");
}
if (!TARGET_CSV_DIR) {
  throw new Error("No target directory specified");
}

const parsed = await loadPronunciations(SOURCE_CSV);
const pronunciations = processPronunciations(parsed);
await writePronunciations(pronunciations);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed);
}

/**
 * Load pronunciations from CSV
 */
async function loadPronunciations(path: string): Promise<Data> {
  log.info(`Loading pronunciations from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

/**
 * Process pronunciations
 * Returns object with pronunciations as values, pronunciation is object with name and array of exercises
 * Note, discard slow audio since duplicate of fast
 */
function processPronunciations(parsed: Data): Pronunciations {
  log.info(`Processing pronunciations...`);

  const pronunciations: Pronunciations = {};

  parsed.forEach(
    (
      {
        identifier: id,
        lesson,
        pinyin,
        description,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      // get name without pinyin words
      const r1 = /^Pronunciation (.+)\n/;
      const name = lesson.trim().match(r1)[1];

      const r2 = /\d+/;
      const lessonNo = name.match(r2)[0];
      const r3 = /^main_slide-(\d+)$/;
      const exerciseNo = id.trim().match(r3)[1];
      const identifier = `P${lessonNo}-${exerciseNo}`;

      log.info(`Processing exercise ${identifier}`);

      const audio = getAudioFileName(audioFastUrl);

      if (audioSlowUrl != audioFastUrl) {
        throw new Error(
          `Slow audio is not duplicate of fast audio`,
        );
      }

      if (description == "null") {
        description = "";
      }

      const exercise: Exercise = {
        identifier,
        pinyin: pinyin.trim(),
        description: description.trim(),
        audio,
      };

      // create pronunciation on first encounter
      if (pronunciations[name] === undefined) {
        pronunciations[name] = {} as Pronunciation;
        pronunciations[name].exercises = [];
      }
      pronunciations[name].name = name;
      pronunciations[name].exercises.push(exercise);
    },
  );

  return pronunciations;
}

/**
 * Write processed pronunciations to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
async function writePronunciations(
  pronunciations: Pronunciations,
): Promise<void> {
  log.info(`Writing pronunciations to '${TARGET_CSV_DIR}'...`);

  const promises = [];

  for (const { name, exercises } of Object.values(pronunciations)) {
    log.info(`Writing pronunciation ${name}...`);
    const pronunciationPath = join(TARGET_CSV_DIR, name + ".csv");

    const csvString = stringifyCsv(exercises, {
      columns: COLUMNS_OUTPUT,
      headers: false,
    });
    if (await exists(pronunciationPath)) {
      log.debug(
        `Skip writing pronunciation because already exists.`,
      );
    } else {
      log.debug(`Write pronunciation ${name}.`);
      promises.push(Deno.writeTextFile(pronunciationPath, csvString));
    }
  }

  await Promise.all(promises);
}

/**
 * Download audio files
 * Skips files that already exist
 */
async function downloadAudios(parsed: Data): Promise<void> {
  log.info(
    `Downloading audios into ${TARGET_AUDIO_DIR}... with ${
      DOWNLOAD_DELAY / 1000
    } seconds delay`,
  );

  for (const { audioFastUrl: audioUrl } of parsed) {
    log.info(`Downloading audio ${getAudioFileName(audioUrl)}...`);
    let timeout: Promise<void> | undefined;

    const audioPath = join(
      TARGET_AUDIO_DIR,
      getAudioFileName(audioUrl),
    );

    if (await exists(audioPath)) {
      log.debug(
        `Skip downloading audio because already exists.`,
      );
    } else {
      log.debug(`Downloading audio.`);
      timeout = delay(DOWNLOAD_DELAY);
      await downloadFile(audioUrl, audioPath);
    }

    await timeout;
  }
}

/**
 * Get filename for audio from URL
 * Add "IC " to beginning
 */
function getAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(base, "->", newBase);
  return newBase;
}
