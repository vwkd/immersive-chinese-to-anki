import { loadVocabulary, writeVocabulary } from "./csv.ts";
import { processVocabulary } from "./process.ts";
import { downloadAudios } from "./audio.ts";

export const COLUMNS_INPUT = [
  "web-scraper-order",
  "web-scraper-start-url",
  "identifier",
  "lesson",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
] as const;
export const COLUMNS_OUTPUT = [
  "identifier",
  "simplified",
  "traditional",
  "pinyin",
  "translation",
  "audio",
] as const;

const [SOURCE_CSV, TARGET_CSV_DIR, TARGET_AUDIO_DIR] = Deno.args;

if (!SOURCE_CSV) {
  throw new Error("No source file specified");
}
if (!TARGET_CSV_DIR) {
  throw new Error("No target directory specified");
}

const parsed = await loadVocabulary(SOURCE_CSV);
const vocabulary = processVocabulary(parsed);
await writeVocabulary(vocabulary, TARGET_CSV_DIR);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed, TARGET_AUDIO_DIR);
}
