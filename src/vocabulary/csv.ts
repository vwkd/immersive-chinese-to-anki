import { log } from "../logger.ts";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import type { Data, Vocabulary } from "./types.ts";

/**
 * Load vocabulary from CSV
 */
export async function loadVocabulary(path: string): Promise<Data> {
  log.info(`Loading vocabulary from '${path}'...`);
  const input = await Deno.readTextFile(path);
  const content = parseCsv(input, {
    skipFirstRow: true,
    columns: COLUMNS_INPUT,
  });
  return content;
}

/**
 * Write processed vocabulary to CSV
 * Skips if file already exists
 * Note, doesn't use header since Anki can't skip it
 */
export async function writeVocabulary(
  vocabulary: Vocabulary,
  dir: string,
): Promise<void> {
  log.info(`Writing vocabulary to '${dir}'...`);

  const vocabularyPath = join(dir, "vocabulary.csv");

  const csvString = stringifyCsv(vocabulary, {
    columns: COLUMNS_OUTPUT,
    headers: false,
  });

  if (await exists(vocabularyPath)) {
    log.debug(
      `Skip writing vocabulary because already exists.`,
    );
  } else {
    log.debug(`Write vocabulary.`);
    await Deno.writeTextFile(vocabularyPath, csvString);
  }
}
