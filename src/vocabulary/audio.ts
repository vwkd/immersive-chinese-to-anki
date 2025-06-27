import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { delay } from "@std/async/delay";
import { downloadFile } from "../utilities.ts";
import { getAudioFileName } from "./utils.ts";
import type { Data } from "./types.ts";

const DOWNLOAD_DELAY = 1000;

const log = getLogger(["ic-to-anki", "vocabulary", "audio"]);

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

  await Deno.mkdir(dir, { recursive: true });

  for (const { identifier } of parsed) {
    log.info(`Downloading audio for ${identifier}...`);
    let timeout: Promise<void> | undefined;

    const audioPath = join(
      dir,
      getAudioFileName(identifier),
    );

    const audioUrl = `https://www.immersivechinese.com/vocab/${identifier}.mp4`;

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
