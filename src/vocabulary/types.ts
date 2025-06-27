import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";

export type Data = Record<typeof COLUMNS_INPUT[number], string>[];

export type Vocabulary = Record<typeof COLUMNS_OUTPUT[number], string>[];
