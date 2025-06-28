import { getLogger } from "@logtape/logtape";
import { COLUMNS_INPUT, COLUMNS_OUTPUT } from "./main.ts";
import { getAudioFileName } from "./utils.ts";
import { Note, Table } from "../types.ts";

const log = getLogger(["ic-to-anki", "vocabulary", "process"]);

/**
 * Process vocabulary
 *
 * @param parsed data from CSV
 * @returns vocabulary deck
 */
export function processVocabulary(
  parsed: Table<typeof COLUMNS_INPUT>,
): Note<typeof COLUMNS_OUTPUT>[] {
  log.info(`Processing vocabulary...`);

  return parsed.map(
    (
      {
        identifier,
        lesson,
        simplified,
        traditional,
        pinyin,
        translation,
      },
    ) => ({
      noteType: "IC Vocabulary",
      deck: `IC::Vocabulary::Lesson ${lesson}`,
      identifier: identifier.trim(),
      simplified: simplified.trim(),
      traditional: traditional.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      audio: getAudioFileName(identifier),
    } satisfies Note<typeof COLUMNS_OUTPUT>),
  );
}
