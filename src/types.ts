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
