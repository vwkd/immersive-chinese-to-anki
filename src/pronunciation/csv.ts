import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import type { Data, Pronunciations } from "./types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "csv"]);

/**
 * Load pronunciations from CSV
 */
export async function loadPronunciations(path: string): Promise<Data> {
  log.info(`Loading pronunciations from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

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

  const promises = [];

  for (const { name, exercises } of Object.values(pronunciations)) {
    log.info(`Writing pronunciation ${name}...`);
    const pronunciationPath = join(dir, name + ".csv");

    const csvString = stringifyCsv(exercises, {
      columns: COLUMNS_OUTPUT,
      headers: false,
    });
    if (await exists(pronunciationPath)) {
      log.debug(
        `Skip writing pronunciation because already exists.`,
      );
    } else {
      log.debug(`Write pronunciation ${name}.`);
      promises.push(Deno.writeTextFile(pronunciationPath, csvString));
    }
  }

  await Promise.all(promises);
}
