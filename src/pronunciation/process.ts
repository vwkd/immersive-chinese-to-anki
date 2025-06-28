import { getLogger } from "@logtape/logtape";
import { COLUMNS_INPUT } from "./main.ts";
import { getAudioFileName } from "./utils.ts";
import type { Table } from "../types.ts";
import type { Exercise, Pronunciation, Pronunciations } from "./types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "process"]);

/**
 * Process pronunciations
 * Returns object with pronunciations as values, pronunciation is object with name and array of exercises
 * Note, discard slow audio since duplicate of fast
 */
export function processPronunciations(
  parsed: Table<typeof COLUMNS_INPUT>,
): Pronunciations {
  log.info(`Processing pronunciations...`);

  const pronunciations: Pronunciations = {};

  parsed.forEach(
    (
      {
        identifier: id,
        lesson,
        pinyin,
        description,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      // get name without pinyin words
      const r1 = /^Pronunciation (.+)\n/;
      const name = lesson.trim().match(r1)[1];

      const r2 = /\d+/;
      const lessonNo = name.match(r2)[0];
      const r3 = /^main_slide-(\d+)$/;
      const exerciseNo = id.trim().match(r3)[1];
      const identifier = `P${lessonNo}-${exerciseNo}`;

      log.info(`Processing exercise ${identifier}`);

      const audio = getAudioFileName(audioFastUrl);

      if (audioSlowUrl != audioFastUrl) {
        throw new Error(
          `Slow audio is not duplicate of fast audio`,
        );
      }

      if (description == "null") {
        description = "";
      }

      const exercise: Exercise = {
        identifier,
        pinyin: pinyin.trim(),
        description: description.trim(),
        audio,
      };

      // create pronunciation on first encounter
      if (pronunciations[name] === undefined) {
        pronunciations[name] = {} as Pronunciation;
        pronunciations[name].exercises = [];
      }
      pronunciations[name].name = name;
      pronunciations[name].exercises.push(exercise);
    },
  );

  return pronunciations;
}
