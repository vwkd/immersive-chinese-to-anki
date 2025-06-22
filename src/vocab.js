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
  "identifier",
  "lesson",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
];
const COLUMNS_OUTPUT = [
  "lesson",
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

const parsed = await loadVocab(SOURCE_CSV);
const vocab = processVocab(parsed);
await writeVocab(vocab);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed);
}

/**
 * Load vocab from CSV
 */
async function loadVocab(path) {
  log.info(`Loading vocab from '${path}'...`);
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
 * Process vocab
 * Returns object with vocab as values, vocab is object with name and array of exercises
 */
function processVocab(parsed) {
  log.info(`Processing vocab...`);

  const vocab = {};

  return parsed.map(
    (
      {
        identifier,
        lesson,
        simplified,
        traditional,
        pinyin,
        translation,
      },
    ) => {
      return {
        lesson: lesson.trim(),
        identifier: identifier.trim(),
        simplified: simplified.trim(),
        traditional: traditional.trim(),
        pinyin: pinyin.trim(),
        translation: translation.trim(),
        audio: getAudioFileName(identifier),
      };
    },
  );
}

/**
 * Write processed vocab to CSV
 * Skips if file already exist
 * Note, doesn't use header since Anki can't skip it
 */
async function writeVocab(vocab) {
  log.info(`Writing vocab to '${TARGET_CSV_DIR}'...`);

  const vocabPath = join(TARGET_CSV_DIR, "vocab.csv");

  const csvString = await stringifyCsv(vocab, COLUMNS_OUTPUT, {
    headers: false,
  });

  if (await exists(vocabPath)) {
    log.debug(
      `Skip writing vocab because already exists.`,
    );
  } else {
    log.debug(`Write vocab.`);
    await Deno.writeTextFile(vocabPath, csvString);
  }
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
      const blob = await fetchFile(audioUrl);
      await writeFile(audioPath, blob);
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
