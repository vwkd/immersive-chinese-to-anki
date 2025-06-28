import { Command } from "@cliffy/command";
import { loadCsv } from "../csv.ts";
import { writeLessons } from "./csv.ts";
import { processLessons } from "./process.ts";
import { downloadAudios } from "./audio.ts";
import type { Options } from "../types.ts";

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
  "audioFastMaleId",
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
  "audioFastMale",
  "audioSlow",
] as const;

async function createLessons(
  { data, out, audio }: Options,
): Promise<void> {
  if (!data) {
    throw new Error("No source file specified");
  }

  if (!out) {
    throw new Error("No target directory specified");
  }

  const parsed = await loadCsv(data, COLUMNS_INPUT);

  const lessons = processLessons(parsed);

  await writeLessons(lessons, out);

  if (audio) {
    await downloadAudios(parsed, audio);
  }
}

export default new Command()
  .description("Create lessons")
  .option("-d, --data <path:file>", "CSV source file", {
    required: true,
  })
  .option(
    "-o, --out <path:file>",
    "CSV target directory",
    { required: true },
  )
  .option("-a, --audio <path:file>", "Audio target directory")
  .action(createLessons);
