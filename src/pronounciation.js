/**
 * Create Anki CSV and download audio for IC Pronounciation
 * Assumes slow audio is duplicate of fast, discards it
 */

import { log } from "./logger.js";
import { BufReader } from "https://deno.land/std@0.112.0/io/mod.ts";
import {
  parse as parseCsv,
  stringify as stringifyCsv,
} from "https://deno.land/std@0.112.0/encoding/csv.ts";
import {
  join,
  parse as parsePath,
} from "https://deno.land/std@0.112.0/path/mod.ts";
import { delay, exists, fetchFile, writeFile } from "./utilities.js";

const DOWNLOAD_DELAY = 1000;
const COLUMNS_INPUT = [
  "lesson",
  "pinyin",
  "description",
  "audioFastUrl",
  "audioSlowUrl",
  "identifier",
];
const COLUMNS_OUTPUT = [
  "identifier",
  "pinyin",
  "description",
  "audio",
];

const [SOURCE_CSV, TARGET_CSV_DIR, TARGET_AUDIO_DIR] = Deno.args;

if (!SOURCE_CSV) {
  throw new Error("No source file specified");
}
if (!TARGET_CSV_DIR) {
  throw new Error("No target directory specified");
}

const parsed = await loadPronounciations(SOURCE_CSV);
const pronounciations = processPronounciations(parsed);
await writePronounciations(pronounciations);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed);
}

/**
 * Load pronounciations from CSV
 */
async function loadPronounciations(path) {
  log.info(`Loading pronounciations from '${path}'...`);
  const file = await Deno.open(path);
  const input = new BufReader(file);
  const content = await parseCsv(input, {
    skipFirstRow: true,
    /* Throws `Error number of fields line:1`, maybe because other headers have hyphens? */
    /* columns: COLUMNS_INPUT,*/
  });
  Deno.close(file.rid);
  return content;
}

/**
 * Process pronounciations
 * Returns object with pronounciations as values, pronounciation is object with name and array of exercises
 * Note, discard slow audio since duplicate of fast
 */
function processPronounciations(parsed) {
  log.info(`Processing pronounciations...`);

  const pronounciations = {};

  parsed.forEach(
    (
      {
        lesson,
        number,
        pinyin,
        description,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      // get name without pinyin words
      const r1 = /^(.+)\n/;
      const name = lesson.trim().match(r1)[1];

      const r2 = /^.+(\d+)$/;
      const lessonNo = name.match(r2)[1];
      const r3 = /^main_slide-(\d+)$/;
      const exerciseNo = number.trim().match(r3)[1];
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

      const exercise = {
        identifier,
        pinyin: pinyin.trim(),
        description: description.trim(),
        audio,
      };

      // create pronounciation on first encounter
      if (pronounciations[name] === undefined) {
        pronounciations[name] = {};
        pronounciations[name].exercises = [];
      }
      pronounciations[name].name = name;
      pronounciations[name].exercises.push(exercise);
    },
  );

  return pronounciations;
}

/**
 * Write processed pronounciations to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
async function writePronounciations(pronounciations) {
  log.info(`Writing pronounciations to '${TARGET_CSV_DIR}'...`);

  const promises = [];

  for (const { name, exercises } of Object.values(pronounciations)) {
    log.info(`Writing pronounciation ${name}...`);
    const pronounciationPath = join(TARGET_CSV_DIR, name + ".csv");

    const csvString = await stringifyCsv(exercises, COLUMNS_OUTPUT, {
      headers: false,
    });
    if (await exists(pronounciationPath)) {
      log.debug(
        `Skip writing pronounciation because already exists.`,
      );
    } else {
      log.debug(`Write pronounciation ${name}.`);
      promises.push(Deno.writeTextFile(pronounciationPath, csvString));
    }
  }

  await Promise.all(promises);
}

/**
 * Download audio files
 * Skips files that already exist
 */
async function downloadAudios(parsed) {
  log.info(
    `Downloading audios into ${TARGET_AUDIO_DIR}... with ${
      DOWNLOAD_DELAY / 1000
    } seconds delay`,
  );

  for (const { audioFastUrl: audioUrl } of parsed) {
    log.info(`Downloading audio ${getAudioFileName(audioUrl)}...`);
    let timeout;

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
      const blob = await fetchFile(audioUrl);
      await writeFile(audioPath, blob);
    }

    await timeout;
  }
}

/**
 * Get filename for audio from URL
 * Add "IC " to beginning
 */
function getAudioFileName(url) {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(base, "->", newBase);
  return newBase;
}
