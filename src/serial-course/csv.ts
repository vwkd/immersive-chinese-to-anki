import { getLogger } from "@logtape/logtape";
import { dirname } from "@std/path/dirname";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import type { Decks } from "../types.ts";

const log = getLogger(["ic-to-anki", "serial-course", "csv"]);

/**
 * Write lessons to CSV
 *
 * @param lessons lesson decks
 * @param path path to write CSVs to
 */
export async function writeLessons(
  lessons: Decks<typeof COLUMNS_OUTPUT>,
  path: string,
): Promise<void> {
  log.info(`Writing lessons to '${path}'...`);

  const dir = dirname(path);

  await Deno.mkdir(dir, { recursive: true });

  const singleDeck = Object.values(lessons).flatMap((deck) => deck.notes);

  writeCsv(path, singleDeck, COLUMNS_OUTPUT);
}
