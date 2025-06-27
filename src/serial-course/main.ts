import { configure, getConsoleSink } from "@logtape/logtape";
import { loadLessons, writeLessons } from "./csv.ts";
import { processLessons } from "./process.ts";
import { downloadAudios } from "./audio.ts";

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

await configure({
  sinks: {
    console: getConsoleSink(),
  },
  loggers: [
    {
      category: ["ic-to-anki", "serial-course"],
      lowestLevel: "info",
      sinks: ["console"],
    },
    { category: ["logtape", "meta"], sinks: [] },
  ],
});

const parsed = await loadLessons(SOURCE_CSV);
const lessons = processLessons(parsed);
await writeLessons(lessons, TARGET_CSV_DIR);
if (TARGET_AUDIO_DIR) {
  await downloadAudios(parsed, TARGET_AUDIO_DIR);
}
