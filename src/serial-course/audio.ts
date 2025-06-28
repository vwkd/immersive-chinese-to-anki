import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { downloadAudio } from "../audio.ts";
import { COLUMNS_INPUT } from "./main.ts";
import {
  getFastAudioFileName,
  getFastMaleAudioFileName,
  getSlowAudioFileName,
} from "./utils.ts";
import type { Table } from "../types.ts";

const log = getLogger(["ic-to-anki", "serial-course", "audio"]);

/**
 * Download audio files
 * Skips files that already exist
 */
export async function downloadAudios(
  parsed: Table<typeof COLUMNS_INPUT>,
  dir: string,
): Promise<void> {
  log.info(`Downloading audios into ${dir}`);

  await Deno.mkdir(dir, { recursive: true });

  for (
    const { audioFastUrl, audioSlowUrl, audioFastMaleId, identifier } of parsed
  ) {
    log.info(`Downloading audio for ${identifier}...`);

    const fastAudioPath = join(
      dir,
      getFastAudioFileName(audioFastUrl),
    );

    await downloadAudio(audioFastUrl, fastAudioPath);

    const fastMaleAudioPath = join(dir, getFastMaleAudioFileName(audioFastUrl));

    const audioMaleUrl =
      `https://www.immersivechinese.com/male/${audioFastMaleId}.mp4`;

    await downloadAudio(audioMaleUrl, fastMaleAudioPath);

    if (audioSlowUrl != audioFastUrl) {
      const slowAudioPath = join(
        dir,
        getSlowAudioFileName(audioSlowUrl),
      );

      await downloadAudio(audioSlowUrl, slowAudioPath);
    }
  }
}
