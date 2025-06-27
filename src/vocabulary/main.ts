import { log } from "../logger.ts";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { join } from "@std/path";
import { delay } from "@std/async";
import { exists } from "@std/fs";
import { downloadFile } from "../utilities.ts";

const DOWNLOAD_DELAY = 1000;
const COLUMNS_INPUT = [
  "web-scraper-order",
  "web-scraper-start-url",
  "identifier",
  "lesson",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
];
const COLUMNS_OUTPUT = [
  "identifier",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
  "audio",
];

const [SOURCE_CSV, TARGET_CSV_DIR, TARGET_AUDIO_DIR] = Deno.args;

if (!SOURCE_CSV) {
  throw new Error("No source file specified");
}
if (!TARGET_CSV_DIR) {
  throw new Error("No target directory specified");
}

const parsed = await loadVocabulary(SOURCE_CSV);
const vocabulary = processVocabulary(parsed);
await writeVocabulary(vocabulary);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed);
}

/**
 * Load vocabulary from CSV
 */
async function loadVocabulary(path) {
  log.info(`Loading vocabulary from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

/**
 * Process vocabulary
 * Returns object with vocabulary as values, vocabulary is object with name and array of exercises
 */
function processVocabulary(parsed) {
  log.info(`Processing vocabulary...`);

  return parsed.map(
    (
      {
        identifier,
        simplified,
        traditional,
        pinyin,
        translation,
      },
    ) => ({
      identifier: identifier.trim(),
      simplified: simplified.trim(),
      traditional: traditional.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      audio: getAudioFileName(identifier),
    }),
  );
}

/**
 * Write processed vocabulary to CSV
 * Skips if file already exists
 * Note, doesn't use header since Anki can't skip it
 */
async function writeVocabulary(vocabulary) {
  log.info(`Writing vocabulary to '${TARGET_CSV_DIR}'...`);

  const vocabularyPath = join(TARGET_CSV_DIR, "vocabulary.csv");

  const csvString = stringifyCsv(vocabulary, {
    columns: COLUMNS_OUTPUT,
    headers: false,
  });

  if (await exists(vocabularyPath)) {
    log.debug(
      `Skip writing vocabulary because already exists.`,
    );
  } else {
    log.debug(`Write vocabulary.`);
    await Deno.writeTextFile(vocabularyPath, csvString);
  }
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

  for (const { identifier } of parsed) {
    log.info(`Downloading audio for ${identifier}...`);
    let timeout;

    const audioPath = join(
      TARGET_AUDIO_DIR,
      getAudioFileName(identifier),
    );

    const audioUrl = `https://www.immersivechinese.com/vocab/${identifier}.mp4`;

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
 * Get filename for audio from identifier
 * Add "IC " to beginning and ".mp4" to end
 */
function getAudioFileName(identifier) {
  const newBase = "IC " + identifier + ".mp4";
  return newBase;
}
