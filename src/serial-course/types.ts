import { COLUMNS_OUTPUT } from "./main.ts";

export type Exercise = Record<typeof COLUMNS_OUTPUT[number], string>;

export interface Lesson {
  name: string;
  exercises: Exercise[];
}

export type Lessons = Record<string, Lesson>;
