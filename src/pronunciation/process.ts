import { getLogger } from "@logtape/logtape";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import { getAudioFileName } from "./utils.ts";
import type { Deck, Decks, Note, Table } from "../types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "process"]);

/**
 * Process pronunciations
 *
 * - note: discard slow audio since duplicate of fast
 *
 * @param parsed data from CSV
 * @returns pronunciation decks
 */
export function processPronunciations(
  parsed: Table<typeof COLUMNS_INPUT>,
): Decks<typeof COLUMNS_OUTPUT> {
  log.info(`Processing pronunciations...`);

  const pronunciations: Decks<typeof COLUMNS_OUTPUT> = {};

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

      const exercise: Note<typeof COLUMNS_OUTPUT> = {
        identifier,
        pinyin: pinyin.trim(),
        description: description.trim(),
        audio,
      };

      // create pronunciation on first encounter
      if (pronunciations[name] === undefined) {
        pronunciations[name] = {} as Deck<typeof COLUMNS_OUTPUT>;
        pronunciations[name].notes = [];
      }
      pronunciations[name].name = name;
      pronunciations[name].notes.push(exercise);
    },
  );

  return pronunciations;
}
