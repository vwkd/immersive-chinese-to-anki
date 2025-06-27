import { getLogger } from "@logtape/logtape";
import { getAudioFileName } from "./utils.ts";
import type { Data, Vocabulary } from "./types.ts";

const log = getLogger(["ic-to-anki", "vocabulary", "process"]);

/**
 * Process vocabulary
 * Returns object with vocabulary as values, vocabulary is object with name and array of exercises
 */
export function processVocabulary(parsed: Data): Vocabulary {
  log.info(`Processing vocabulary...`);

  return parsed.map(
    (
      {
        identifier,
        simplified,
        traditional,
        pinyin,
        translation,
      },
    ) => ({
      identifier: identifier.trim(),
      simplified: simplified.trim(),
      traditional: traditional.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      audio: getAudioFileName(identifier),
    }),
  );
}
