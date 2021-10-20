import { walk } from "https://deno.land/std@0.112.0/fs/mod.ts";
import {
  join,
  parse as parsePath,
} from "https://deno.land/std@0.112.0/path/mod.ts";
import { log } from "./logger.ts";

const TARGET_AUDIO_DIR = "audios";
const DRY_RUN = true;

await renameAudios();

async function renameAudios() {
  log.info("Renaming audios...");

  const promises = [];

  for await (
    const entry of walk(TARGET_AUDIO_DIR, {
      includeDirs: false,
      exts: [".mp4"],
    })
  ) {
    const path = entry.path;

    const { root, dir, base, name, ext } = parsePath(path);
    let newName = "IC ";

    const regex = /^(.+) (Slow)(.+)$/;
    const matches = name.match(regex);

    if (matches) {
      // slow audio
      newName += matches[1] + matches[3] + " " + matches[2];
    } else {
      newName += name;
    }

    const newBase = newName + ext;
    const newPath = join(root, dir, newBase);

    console.log(base, "->", newBase);
    if (!DRY_RUN) {
      promises.push(Deno.rename(path, newPath));
    }
  }

  await Promise.all(promises);
}
