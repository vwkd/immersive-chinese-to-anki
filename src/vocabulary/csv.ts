import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import { Note } from "../types.ts";

const log = getLogger(["ic-to-anki", "vocabulary", "csv"]);

/**
 * Write vocabulary to CSV
 *
 * @param vocabulary vocabulary deck
 * @param dir directory to write CSV to
 */
export async function writeVocabulary(
  vocabulary: Note<typeof COLUMNS_OUTPUT>[],
  dir: string,
): Promise<void> {
  log.info(`Writing vocabulary to '${dir}'...`);

  await Deno.mkdir(dir, { recursive: true });

  const vocabularyPath = join(dir, "vocabulary.csv");

  await writeCsv(vocabularyPath, vocabulary, COLUMNS_OUTPUT);
}
