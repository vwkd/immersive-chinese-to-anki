import { log } from "../logger.ts";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { delay } from "@std/async/delay";
import { downloadFile } from "../utilities.ts";
import { getAudioFileName } from "./utils.ts";
import type { Data } from "./types.ts";

const DOWNLOAD_DELAY = 1000;

/**
 * Download audio files
 * Skips files that already exist
 */
export async function downloadAudios(parsed: Data, dir: string): Promise<void> {
  log.info(
    `Downloading audios into ${dir}... with ${
      DOWNLOAD_DELAY / 1000
    } seconds delay`,
  );

  for (const { audioFastUrl: audioUrl } of parsed) {
    log.info(`Downloading audio ${getAudioFileName(audioUrl)}...`);
    let timeout: Promise<void> | undefined;

    const audioPath = join(
      dir,
      getAudioFileName(audioUrl),
    );

    if (await exists(audioPath)) {
      log.debug(
        `Skip downloading audio because already exists.`,
      );
    } else {
      log.debug(`Downloading audio.`);
      timeout = delay(DOWNLOAD_DELAY);
      await downloadFile(audioUrl, audioPath);
    }

    await timeout;
  }
}
