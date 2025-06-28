import { getLogger } from "@logtape/logtape";
import { join } from "@std/path/join";
import { downloadAudio } from "../audio.ts";
import { COLUMNS_INPUT } from "./main.ts";
import { getAudioFileName } from "./utils.ts";
import type { Table } from "../types.ts";

const log = getLogger(["ic-to-anki", "pronunciation", "audio"]);

/**
 * Download audio files
 *
 * @param parsed data from CSV
 * @param dir directory to download audio files to
 */
export async function downloadAudios(
  parsed: Table<typeof COLUMNS_INPUT>,
  dir: string,
): Promise<void> {
  log.info(`Downloading audios into ${dir}`);

  await Deno.mkdir(dir, { recursive: true });

  for (const { audioFastUrl } of parsed) {
    const audioFastPath = join(dir, getAudioFileName(audioFastUrl));

    await downloadAudio(audioFastUrl, audioFastPath);
  }
}
