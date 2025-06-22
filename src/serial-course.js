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
  "simplified",
  "traditional",
  "translation",
  "note",
  "audioFastUrl",
  "audioSlowUrl",
  "identifier",
];
const COLUMNS_OUTPUT = [
  "identifier",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
  "note",
  "audioFast",
  "audioSlow",
];

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
async function loadLessons(path) {
  log.info(`Loading lessons from '${path}'...`);
  const file = await Deno.open(path);
  const input = new BufReader(file);
  const content = await parseCsv(input, {
    skipFirstRow: true,
    /* Throws `Error number of fields line:1`, maybe because other headers have hyphens? */
    /* columns: COLUMNS_INPUT,*/
  });
  file.close(file.rid);
  return content;
}

/**
 * Process lessons
 * Returns object with lessons as values, lesson is object with name and array of exercises
 * Note, slow audio is duplicate of fast if not available
 * Note, lessons can have more or less than 25 exercises
 */
function processLessons(parsed) {
  log.info(`Processing lessons...`);

  const lessons = {};

  parsed.forEach(
    (
      {
        lesson,
        identifier,
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

      let audioSlow;
      if (audioSlowUrl != audioFastUrl) {
        audioSlow = getSlowAudioFileName(audioSlowUrl);
      } else {
        log.debug(`${identifier}: missing slow audio`);
      }

      if (note == "null") {
        note = "";
      }

      const exercise = {
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
        lessons[name] = {};
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
async function writeLessons(lessons) {
  log.info(`Writing lessons to '${TARGET_CSV_DIR}'...`);

  const promises = [];

  for (const { name, exercises } of Object.values(lessons)) {
    log.info(`Writing lesson ${name}...`);
    const lessonPath = join(TARGET_CSV_DIR, name + ".csv");

    const csvString = await stringifyCsv(exercises, COLUMNS_OUTPUT, {
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
async function downloadAudios(parsed) {
  log.info(
    `Downloading audios into ${TARGET_AUDIO_DIR}... with ${DOWNLOAD_DELAY / 1000
    } seconds delay`,
  );

  for (const { audioFastUrl, audioSlowUrl, identifier } of parsed) {
    log.info(`Downloading audio for ${identifier}...`);
    let timeout;

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
      const blob = await fetchFile(audioFastUrl);
      await writeFile(fastAudioPath, blob);
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
        const blob = await fetchFile(audioSlowUrl);
        await writeFile(slowAudioPath, blob);
      }
    }

    await timeout;
  }
}

/**
 * Get filename for fast audio from URL
 * Add "IC " to beginning
 */
function getFastAudioFileName(url) {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(base, "->", newBase);
  return newBase;
}

/**
 * Get filename for slow audio from URL
 * Add "IC " to beginning, move "Slow" to end
 * Note, URL can be undefined if not present!
 */
function getSlowAudioFileName(url) {
  const { base, name, ext } = parsePath(url);
  const regex = /^(.+) (Slow)(.+)$/;
  const matches = name.match(regex);
  const newName = "IC " + matches[1] + matches[3] + " " + matches[2];
  const newBase = newName + ext;
  log.debug(base, "->", newBase);
  return newBase;
}
