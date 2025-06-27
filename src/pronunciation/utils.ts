import { getLogger } from "@logtape/logtape";
import { parse as parsePath } from "@std/path";

const log = getLogger(["ic-to-anki", "pronunciation", "utils"]);

/**
 * Get filename for audio from URL
 * Add "IC " to beginning
 */
export function getAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(`${base} -> ${newBase}`);
  return newBase;
}
