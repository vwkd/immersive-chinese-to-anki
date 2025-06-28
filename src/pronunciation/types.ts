import { COLUMNS_OUTPUT } from "./main.ts";

export type Exercise = Record<typeof COLUMNS_OUTPUT[number], string>;

export interface Pronunciation {
  name: string;
  exercises: Exercise[];
}

export type Pronunciations = Record<
  string,
  Pronunciation
>;
