import { getLogger } from "@logtape/logtape";
import { exists } from "@std/fs/exists";
import { delay } from "@std/async/delay";
import { downloadFile } from "./utilities.ts";

const DOWNLOAD_DELAY = 1000;

const log = getLogger(["ic-to-anki", "audio"]);

/**
 * Download audio file
 *
 * - skips file if already exists
 *
 * @param url URL of audio file
 * @param path path for audio file
 */
export async function downloadAudio(
  url: string,
  path: string,
): Promise<void> {
  log.info(`Downloading audio to '${path}'...`);

  if (await exists(path)) {
    log.debug(`Skip downloading audio because already exists.`);

    return;
  } else {
    log.debug(`Downloading audio.`);

    await downloadFile(url, path);

    return delay(DOWNLOAD_DELAY);
  }
}
