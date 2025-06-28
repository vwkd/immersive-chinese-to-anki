import { getLogger } from "@logtape/logtape";
import { exists } from "@std/fs/exists";
import { parse as parseCsv, stringify as stringifyCsv } from "@std/csv";
import type { Table } from "./types.ts";

const log = getLogger(["ic-to-anki", "csv"]);

/**
 * Load data from CSV
 *
 * @param path path to CSV
 * @param columns columns of CSV
 * @returns parsed data from CSV
 */
export async function loadCsv<Columns extends readonly string[]>(
  path: string,
  columns: Columns,
): Promise<Table<Columns>> {
  log.info(`Loading CSV from '${path}'...`);

  const input = await Deno.readTextFile(path);

  const content = parseCsv(input, {
    skipFirstRow: true,
    columns,
  }) as Table<Columns>;

  return content;
}

/**
 * Write data to CSV
 *
 * - skips file if already exists
 * - note, doesn't use header since Anki can't skip it
 *
 * @param path path to write CSV to
 * @param data data to write to CSV
 * @param columns selected columns from data
 */
export async function writeCsv<
  Columns extends readonly string[],
  SelectedColumns extends Columns,
>(
  path: string,
  data: Table<Columns>,
  columns: SelectedColumns,
): Promise<void> {
  log.info(`Writing CSV to '${path}'...`);

  const csvString = stringifyCsv(data, {
    columns,
    headers: false,
  });

  if (await exists(path)) {
    log.debug(`Skip writing data because already exists.`);

    return;
  } else {
    log.debug(`Write data.`);

    return Deno.writeTextFile(path, csvString);
  }
}
