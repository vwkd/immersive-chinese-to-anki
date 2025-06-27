/**
 * Create Anki CSV and download audio for IC Pronunciation
 * Assumes slow audio is duplicate of fast, discards it
 */

import { loadPronunciations, writePronunciations } from "./csv.ts";
import { processPronunciations } from "./process.ts";
import { downloadAudios } from "./audio.ts";

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
await writePronunciations(pronunciations, TARGET_CSV_DIR);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed, TARGET_AUDIO_DIR);
}
