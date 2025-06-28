import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { writeCsv } from "../csv.ts";
import { COLUMNS_OUTPUT } from "./main.ts";
import type { Pronunciations } from "./types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "csv"]);

/**
 * Write processed pronunciations to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
export async function writePronunciations(
  pronunciations: Pronunciations,
  dir: string,
): Promise<void> {
  log.info(`Writing pronunciations to '${dir}'...`);

  await Deno.mkdir(dir, { recursive: true });

  const promises = [];

  for (const { name, exercises } of Object.values(pronunciations)) {
    const pronunciationPath = join(dir, name + ".csv");

    promises.push(writeCsv(pronunciationPath, exercises, COLUMNS_OUTPUT));
  }

  await Promise.all(promises);
}
