/**
 * Options of command
 */
export interface Options {
  /**
   * Path to CSV source file
   */
  data: string;
  /**
   * Path to CSV target directory
   */
  out: string;
  /**
   * Path to audio target directory
   */
  audio?: string;
}

/**
 * Table of CSV
 */
export type Table<Columns extends readonly string[]> = Record<
  Columns[number],
  string
>[];
