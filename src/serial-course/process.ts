import { log } from "../logger.ts";
import { getFastAudioFileName, getSlowAudioFileName } from "./utils.ts";
import type { Data, Exercise, Lesson, Lessons } from "./types.ts";

/**
 * Process lessons
 * Returns object with lessons as values, lesson is object with name and array of exercises
 * Note, slow audio is duplicate of fast if not available
 * Note, lessons can have more or less than 25 exercises
 */
export function processLessons(parsed: Data): Lessons {
  log.info(`Processing lessons...`);

  const lessons: Lessons = {};

  parsed.forEach(
    (
      {
        identifier,
        lesson,
        pinyin,
        simplified,
        traditional,
        translation,
        note,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      // get name without pinyin words
      const regex = /^(.+)\n/;
      const name = lesson.trim().match(regex)[1];

      const audioFast = getFastAudioFileName(audioFastUrl);

      let audioSlow = "";
      if (audioSlowUrl != audioFastUrl) {
        audioSlow = getSlowAudioFileName(audioSlowUrl);
      } else {
        log.debug(`${identifier}: missing slow audio`);
      }

      if (note == "null") {
        note = "";
      }

      const exercise: Exercise = {
        identifier: identifier.trim(),
        pinyin: pinyin.trim(),
        simplified: simplified.trim(),
        traditional: traditional.trim(),
        translation: translation.trim(),
        note: note.trim(),
        audioFast,
        audioSlow,
      };

      // create lesson on first encounter
      if (lessons[name] === undefined) {
        lessons[name] = {} as Lesson;
        lessons[name].exercises = [];
      }
      lessons[name].name = name;
      lessons[name].exercises.push(exercise);
    },
  );

  return lessons;
}
