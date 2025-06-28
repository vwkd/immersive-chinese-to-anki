import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import type { Decks } from "../types.ts";

const log = getLogger(["ic-to-anki", "serial-course", "csv"]);

/**
 * Write processed lessons to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
export async function writeLessons(
  lessons: Decks<typeof COLUMNS_OUTPUT>,
  dir: string,
): Promise<void> {
  log.info(`Writing lessons to '${dir}'...`);

  await Deno.mkdir(dir, { recursive: true });

  const promises = [];

  for (const { name, notes } of Object.values(lessons)) {
    const lessonPath = join(dir, name + ".csv");

    promises.push(writeCsv(lessonPath, notes, COLUMNS_OUTPUT));
  }

  await Promise.all(promises);
}
