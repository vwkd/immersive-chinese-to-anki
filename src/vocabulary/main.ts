import { Command } from "@cliffy/command";
import { loadCsv } from "../csv.ts";
import { writeVocabulary } from "./csv.ts";
import { processVocabulary } from "./process.ts";
import { downloadAudios } from "./audio.ts";
import type { Options } from "../types.ts";

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

/**
 * Create vocabulary deck and download audio
 *
 * @param options command line options
 */
async function createVocabulary({ data, out, audio }: Options): Promise<void> {
  if (!data) {
    throw new Error("No source file specified");
  }

  if (!out) {
    throw new Error("No target directory specified");
  }

  const parsed = await loadCsv(data, COLUMNS_INPUT);

  const vocabulary = processVocabulary(parsed);

  await writeVocabulary(vocabulary, out);

  if (audio) {
    await downloadAudios(parsed, audio);
  }
}

export default new Command()
  .description("Create vocabulary")
  .option("-d, --data <path:file>", "CSV source file", {
    required: true,
  })
  .option(
    "-o, --out <path:file>",
    "CSV target directory",
    { required: true },
  )
  .option("-a, --audio <path:file>", "Audio target directory")
  .action(createVocabulary);
