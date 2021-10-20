import { log } from "./logger.ts";

export function delay(ms: number): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms);
  });
}

export async function exists(path: string): Promise<boolean> {
  try {
    const file = await Deno.open(path);
    Deno.close(file.rid);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
}

export async function fetchFile(url: string): Promise<Blob | undefined> {
  try {
    const res = await fetch(url);
    log.debug("Fetching", url);
    if (!res.ok) {
      log.error("HTTP failed", res.url, res.status, res.statusText);
    }
    try {
      return await res.blob();
    } catch (err) {
      log.error("Blob failed", err);
    }
  } catch (err) {
    log.error("Network failed", err);
  }
}

export async function writeFile(path: string, blob: Blob): Promise<void> {
  const buffer = await blob.arrayBuffer();
  const data = new Deno.Buffer(buffer).bytes();

  try {
    await Deno.writeFile(path, data);
    log.debug("Writing", path);
  } catch (err) {
    log.error("Writing failed", path, err);
  }
}
