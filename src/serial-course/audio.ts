import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { exists } from "@std/fs/exists";
import { delay } from "@std/async/delay";
import { downloadFile } from "../utilities.ts";
import {
  getFastAudioFileName,
  getFastMaleAudioFileName,
  getSlowAudioFileName,
} from "./utils.ts";
import type { Data } from "./types.ts";

const DOWNLOAD_DELAY = 1000;

const log = getLogger(["ic-to-anki", "serial-course", "audio"]);

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

  for (
    const { audioFastUrl, audioSlowUrl, audioFastMaleId, identifier } of parsed
  ) {
    log.info(`Downloading audio for ${identifier}...`);
    let timeout: Promise<void> | undefined;

    const fastAudioPath = join(
      dir,
      getFastAudioFileName(audioFastUrl),
    );

    if (await exists(fastAudioPath)) {
      log.debug(
        `Skip downloading fast audio because already exists.`,
      );
    } else {
      log.debug(`Downloading fast audio.`);
      timeout = delay(DOWNLOAD_DELAY);
      await downloadFile(audioFastUrl, fastAudioPath);
    }

    const fastMaleAudioPath = join(dir, getFastMaleAudioFileName(audioFastUrl));

    const audioMaleUrl =
      `https://www.immersivechinese.com/male/${audioFastMaleId}.mp4`;

    if (await exists(fastMaleAudioPath)) {
      log.debug(
        `Skip downloading fast male audio because already exists.`,
      );
    } else {
      log.debug(`Downloading fast male audio.`);
      if (!timeout) timeout = delay(DOWNLOAD_DELAY);
      await downloadFile(audioMaleUrl, fastMaleAudioPath);
    }

    if (audioSlowUrl != audioFastUrl) {
      const slowAudioPath = join(
        dir,
        getSlowAudioFileName(audioSlowUrl),
      );

      if (await exists(slowAudioPath)) {
        log.debug(
          `Skip downloading slow audio because already exists.`,
        );
      } else {
        log.debug(`Downloading slow audio.`);
        if (!timeout) timeout = delay(DOWNLOAD_DELAY);
        await downloadFile(audioSlowUrl, slowAudioPath);
      }
    }

    await timeout;
  }
}
