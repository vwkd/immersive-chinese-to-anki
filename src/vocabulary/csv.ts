import { getLogger } from "@logtape/logtape";
import { dirname } from "@std/path/dirname";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import { Note } from "../types.ts";

const log = getLogger(["ic-to-anki", "vocabulary", "csv"]);

/**
 * Write vocabulary to CSV
 *
 * @param vocabulary vocabulary deck
 * @param path path to write CSV to
 */
export async function writeVocabulary(
  vocabulary: Note<typeof COLUMNS_OUTPUT>[],
  path: string,
): Promise<void> {
  log.info(`Writing vocabulary to '${path}'...`);

  const dir = dirname(path);

  await Deno.mkdir(dir, { recursive: true });

  await writeCsv(path, vocabulary, COLUMNS_OUTPUT);
}
