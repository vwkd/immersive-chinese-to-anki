import { Command } from "@cliffy/command";
import { loadCsv } from "../csv.ts";
import { processPronunciations } from "./process.ts";
import { writePronunciations } from "./csv.ts";
import { downloadAudios } from "./audio.ts";
import type { Options } from "../types.ts";

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

/**
 * Create pronunciation decks and download audio
 *
 * - note: assumes slow audio is duplicate of fast, discards it
 *
 * @param options command line options
 */
async function createPronunciations(
  { data, out, audio }: Options,
): Promise<void> {
  if (!data) {
    throw new Error("No source file specified");
  }

  if (!out) {
    throw new Error("No target directory specified");
  }

  const parsed = await loadCsv(data, COLUMNS_INPUT);

  const lessons = processPronunciations(parsed);

  await writePronunciations(lessons, out);

  if (audio) {
    await downloadAudios(parsed, audio);
  }
}

export default new Command()
  .description("Create pronunciations")
  .option("-d, --data <path:file>", "CSV source file", { required: true })
  .option("-o, --out <path:file>", "CSV target directory", { required: true })
  .option("-a, --audio <path:file>", "Audio target directory")
  .action(createPronunciations);
