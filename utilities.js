import { log } from "./logger.js"

export async function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  })
}

export async function exists(path) {
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

export async function fetchFile(url) {
  try {
    const res = await fetch(url);
    log.debug("Fetching", url);
    if (!res.ok) {
      log.error("HTTP failed", res.url, res.status, res.statusText)
    }
    try {
      return await res.blob();
    } catch (err) {
      log.error("Blob failed", err)
    }
  } catch (err) {
    log.error("Network failed", err)
  }
}

export async function writeFile(path, blob) {
  const buffer = await blob.arrayBuffer();
  const data = new Deno.Buffer(buffer).bytes();

  try {
    await Deno.writeFile(path, data)
    log.debug("Writing", path);
  } catch (err) {
    log.error("Writing failed", path, err);
  }
}