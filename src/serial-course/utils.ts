import { getLogger } from "@logtape/logtape";
import { parse as parsePath } from "@std/path";

const log = getLogger(["ic-to-anki", "serial-course", "utils"]);

/**
 * Get filename for fast audio from URL
 * Add "IC " to beginning
 */
export function getFastAudioFileName(url: string): string {
  const { base } = parsePath(url);
  const newBase = "IC " + base;
  log.debug(`${base} -> ${newBase}`);
  return newBase;
}

/**
 * Get filename for fast male audio from fast audio filename
 * Add "IC " to beginning and "Male" to end
 */
export function getFastMaleAudioFileName(url: string): string {
  const { name } = parsePath(url);
  const newBase = `IC ${name} Male.mp4`;
  log.debug(`${name} -> ${newBase}`);
  return newBase;
}

/**
 * Get filename for slow audio from URL
 * Add "IC " to beginning, move "Slow" to end
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
