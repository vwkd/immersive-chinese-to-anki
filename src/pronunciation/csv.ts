import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import type { Decks } from "../types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "csv"]);

/**
 * Write pronunciations to CSV
 *
 * @param pronunciations pronunciation decks
 * @param dir directory to write CSVs to
 */
export async function writePronunciations(
  pronunciations: Decks<typeof COLUMNS_OUTPUT>,
  dir: string,
): Promise<void> {
  log.info(`Writing pronunciations to '${dir}'...`);

  await Deno.mkdir(dir, { recursive: true });

  const promises = [];

  for (const { name, notes } of Object.values(pronunciations)) {
    const pronunciationPath = join(dir, name + ".csv");

    promises.push(writeCsv(pronunciationPath, notes, COLUMNS_OUTPUT));
  }

  await Promise.all(promises);
}
