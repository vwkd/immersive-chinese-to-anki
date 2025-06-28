import { getLogger } from "@logtape/logtape";
import { parse as parsePath } from "@std/path";

const log = getLogger(["ic-to-anki", "pronunciation", "utils"]);

/**
 * Get filename for audio
 *
 * - adds "IC " to beginning
 *
 * @param url URL of audio
 * @returns filename of audio
 */
export function getAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(`${base} -> ${newBase}`);
  return newBase;
}
