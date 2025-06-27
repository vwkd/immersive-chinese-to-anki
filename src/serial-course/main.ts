import { log } from "../logger.ts";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { join, parse as parsePath } from "@std/path";
import { delay } from "@std/async";
import { exists } from "@std/fs";
import { downloadFile } from "../utilities.ts";
import type { Data, Exercise, Lesson, Lessons } from "./types.ts";

const DOWNLOAD_DELAY = 1000;
export const COLUMNS_INPUT = [
  "web-scraper-order",
  "web-scraper-start-url",
  "lesson",
  "lesson-href",
  "pinyin",
  "simplified",
  "traditional",
  "translation",
  "note",
  "audioFastUrl",
  "audioSlowUrl",
  "identifier",
] as const;
export const COLUMNS_OUTPUT = [
  "identifier",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
  "note",
  "audioFast",
  "audioSlow",
] as const;

const [SOURCE_CSV, TARGET_CSV_DIR, TARGET_AUDIO_DIR] = Deno.args;

if (!SOURCE_CSV) {
  throw new Error("No source file specified");
}
if (!TARGET_CSV_DIR) {
  throw new Error("No target directory specified");
}

const parsed = await loadLessons(SOURCE_CSV);
const lessons = processLessons(parsed);
await writeLessons(lessons);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed);
}

/**
 * Load lessons from CSV
 */
async function loadLessons(path: string): Promise<Data> {
  log.info(`Loading lessons from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

/**
 * Process lessons
 * Returns object with lessons as values, lesson is object with name and array of exercises
 * Note, slow audio is duplicate of fast if not available
 * Note, lessons can have more or less than 25 exercises
 */
function processLessons(parsed: Data): Lessons {
  log.info(`Processing lessons...`);

  const lessons: Lessons = {};

  parsed.forEach(
    (
      {
        identifier,
        lesson,
        pinyin,
        simplified,
        traditional,
        translation,
        note,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      // get name without pinyin words
      const regex = /^(.+)\n/;
      const name = lesson.trim().match(regex)[1];

      const audioFast = getFastAudioFileName(audioFastUrl);

      let audioSlow = "";
      if (audioSlowUrl != audioFastUrl) {
        audioSlow = getSlowAudioFileName(audioSlowUrl);
      } else {
        log.debug(`${identifier}: missing slow audio`);
      }

      if (note == "null") {
        note = "";
      }

      const exercise: Exercise = {
        identifier: identifier.trim(),
        pinyin: pinyin.trim(),
        simplified: simplified.trim(),
        traditional: traditional.trim(),
        translation: translation.trim(),
        note: note.trim(),
        audioFast,
        audioSlow,
      };

      // create lesson on first encounter
      if (lessons[name] === undefined) {
        lessons[name] = {} as Lesson;
        lessons[name].exercises = [];
      }
      lessons[name].name = name;
      lessons[name].exercises.push(exercise);
    },
  );

  return lessons;
}

/**
 * Write processed lessons to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
async function writeLessons(lessons: Lessons): Promise<void> {
  log.info(`Writing lessons to '${TARGET_CSV_DIR}'...`);

  const promises = [];

  for (const { name, exercises } of Object.values(lessons)) {
    log.info(`Writing lesson ${name}...`);
    const lessonPath = join(TARGET_CSV_DIR, name + ".csv");

    const csvString = stringifyCsv(exercises, {
      columns: COLUMNS_OUTPUT,
      headers: false,
    });
    if (await exists(lessonPath)) {
      log.debug(
        `Skip writing lesson because already exists.`,
      );
    } else {
      log.debug(`Write lesson ${name}.`);
      promises.push(Deno.writeTextFile(lessonPath, csvString));
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

  for (const { audioFastUrl, audioSlowUrl, identifier } of parsed) {
    log.info(`Downloading audio for ${identifier}...`);
    let timeout: Promise<void> | undefined;

    const fastAudioPath = join(
      TARGET_AUDIO_DIR,
      getFastAudioFileName(audioFastUrl),
    );

    if (await exists(fastAudioPath)) {
      log.debug(
        `Skip downloading fast audio because already exists.`,
      );
    } else {
      log.debug(`Downloading fast audio.`);
      timeout = delay(DOWNLOAD_DELAY);
      await downloadFile(audioFastUrl, fastAudioPath);
    }

    if (audioSlowUrl != audioFastUrl) {
      const slowAudioPath = join(
        TARGET_AUDIO_DIR,
        getSlowAudioFileName(audioSlowUrl),
      );

      if (await exists(slowAudioPath)) {
        log.debug(
          `Skip downloading slow audio because already exists.`,
        );
      } else {
        log.debug(`Downloading slow audio.`);
        if (!timeout) timeout = delay(DOWNLOAD_DELAY);
        await downloadFile(audioSlowUrl, slowAudioPath);
      }
    }

    await timeout;
  }
}

/**
 * Get filename for fast audio from URL
 * Add "IC " to beginning
 */
function getFastAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(base, "->", newBase);
  return newBase;
}

/**
 * Get filename for slow audio from URL
 * Add "IC " to beginning, move "Slow" to end
 */
function getSlowAudioFileName(url: string): string {
  const { base, name, ext } = parsePath(url);
  const regex = /^(.+) (Slow)(.+)$/;
  const matches = name.match(regex);
  const newName = "IC " + matches[1] + matches[3] + " " + matches[2];
  const newBase = newName + ext;
  log.debug(base, "->", newBase);
  return newBase;
}
