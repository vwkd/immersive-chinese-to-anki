import { getLogger } from "@logtape/logtape";
import { parse as parsePath } from "@std/path";

const log = getLogger(["ic-to-anki", "serial-course", "utils"]);

/**
 * Get filename for fast audio
 *
 * - adds "IC " to beginning
 *
 * @param url URL of fast audio
 * @returns filename of fast audio
 */
export function getFastAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(`${base} -> ${newBase}`);
  return newBase;
}

/**
 * Get filename for fast male audio
 *
 * - adds "IC " to beginning and "Male" to end
 *
 * @param url URL of fast audio
 * @returns filename of fast male audio
 */
export function getFastMaleAudioFileName(url: string): string {
  const { name } = parsePath(url);
  const newBase = `IC ${name} Male.mp4`;
  log.debug(`${name} -> ${newBase}`);
  return newBase;
}

/**
 * Get filename for slow audio
 *
 * - adds "IC " to beginning, move "Slow" to end
 *
 * @param url URL of slow audio
 * @returns filename of slow audio
 */
export function getSlowAudioFileName(url: string): string {
  const { base, name, ext } = parsePath(url);
  const regex = /^(.+) (Slow)(.+)$/;
  const matches = name.match(regex);
  const newName = "IC " + matches[1] + matches[3] + " " + matches[2];
  const newBase = newName + ext;
  log.debug(`${base} -> ${newBase}`);
  return newBase;
}
