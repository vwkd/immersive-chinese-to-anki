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

/**
 * Anki note
 */
export type Note<Columns extends readonly string[]> = Record<
  Columns[number],
  string
>;

/**
 * Anki deck
 */
export interface Deck<Columns extends readonly string[]> {
  /**
   * Name of deck
   */
  name: string;
  /**
   * Notes in deck
   */
  notes: Note<Columns>[];
}

/**
 * Collection of Anki decks
 */
export type Decks<Columns extends readonly string[]> = Record<
  string,
  Deck<Columns>
>;
