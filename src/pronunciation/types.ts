import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";

export type Data = Record<typeof COLUMNS_INPUT[number], string>[];

export type Exercise = Record<typeof COLUMNS_OUTPUT[number], string>;

export interface Pronunciation {
  name: string;
  exercises: Exercise[];
}

export type Pronunciations = Record<
  string,
  Pronunciation
>;
