import { log } from "../logger.ts";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import type { Data, Lessons } from "./types.ts";

/**
 * Load lessons from CSV
 */
export async function loadLessons(path: string): Promise<Data> {
  log.info(`Loading lessons from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

/**
 * Write processed lessons to CSV
 * Skips files that already exist
 * Note, doesn't use header since Anki can't skip it
 */
export async function writeLessons(
  lessons: Lessons,
  dir: string,
): Promise<void> {
  log.info(`Writing lessons to '${dir}'...`);

  const promises = [];

  for (const { name, exercises } of Object.values(lessons)) {
    log.info(`Writing lesson ${name}...`);
    const lessonPath = join(dir, name + ".csv");

    const csvString = stringifyCsv(exercises, {
      columns: COLUMNS_OUTPUT,
      headers: false,
    });
    if (await exists(lessonPath)) {
      log.debug(
        `Skip writing lesson because already exists.`,
      );
    } else {
      log.debug(`Write lesson ${name}.`);
      promises.push(Deno.writeTextFile(lessonPath, csvString));
    }
  }

  await Promise.all(promises);
}
