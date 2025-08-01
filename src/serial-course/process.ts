import { getLogger } from "@logtape/logtape";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import {
  getFastAudioFileName,
  getFastMaleAudioFileName,
  getSlowAudioFileName,
} from "./utils.ts";
import { Deck, Decks, Note, Table } from "../types.ts";

const CHAPTERS = {
  "absolute-beginner": "1",
  "early-beginner": "2",
  "mid-level-beginner": "3",
  "upper-beginner": "4",
  "advanced-beginner": "5",
  "basic-intermediate": "6",
  "lower-intermediate": "7",
  "intermediate": "8",
  "extra-stories": "99",
};

const log = getLogger(["ic-to-anki", "serial-course", "process"]);

/**
 * Process lessons
 *
 * - note: slow audio is duplicate of fast if not available
 * - note: lessons can have more or less than 25 exercises
 *
 * @param parsed data from CSV
 * @returns lesson decks
 */
export function processLessons(
  parsed: Table<typeof COLUMNS_INPUT>,
): Decks<typeof COLUMNS_OUTPUT> {
  log.info(`Processing lessons...`);

  const lessons: Decks<typeof COLUMNS_OUTPUT> = {};

  parsed.forEach(
    (
      {
        identifier,
        lesson,
        "lesson-href": href,
        pinyin,
        simplified,
        traditional,
        translation,
        note,
        audioFastUrl,
        audioSlowUrl,
      },
    ) => {
      const r1 = new RegExp(Object.keys(CHAPTERS).join("|"));
      const chapterString = href.trim().match(r1)[0];
      const chapter = CHAPTERS[chapterString];

      // get name without pinyin words
      const regex = /^(.+)\n/;
      const name = lesson.trim().match(regex)[1];

      const audioFast = getFastAudioFileName(audioFastUrl);
      const audioFastMale = getFastMaleAudioFileName(audioFastUrl);

      let audioSlow = "";
      if (audioSlowUrl != audioFastUrl) {
        audioSlow = getSlowAudioFileName(audioSlowUrl);
      } else {
        log.debug(`${identifier}: missing slow audio`);
      }

      if (note == "null") {
        note = "";
      }

      const exercise: Note<typeof COLUMNS_OUTPUT> = {
        noteType: "IC Serial Course",
        deck: `IC::Serial Course::Chapter ${chapter}::${name}`,
        identifier: identifier.trim(),
        pinyin: pinyin.trim(),
        simplified: simplified.trim(),
        traditional: traditional.trim(),
        translation: translation.trim(),
        note: note.trim(),
        audioFast,
        audioFastMale,
        audioSlow,
      };

      // create lesson on first encounter
      if (lessons[name] === undefined) {
        lessons[name] = {} as Deck<typeof COLUMNS_OUTPUT>;
        lessons[name].notes = [];
      }
      lessons[name].name = name;
      lessons[name].notes.push(exercise);
    },
  );

  return lessons;
}
