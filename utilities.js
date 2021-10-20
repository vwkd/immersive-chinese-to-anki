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
  } catch (e) {
    if (e.name == "NotFound") {
      return false;
    } else {
      throw e
    }
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
    } catch (e) {
      log.error("Blob failed", e)
    }
  } catch (e) {
    log.error("Network failed", e)
  }
}

export async function writeFile(path, blob) {
  const buffer = await blob.arrayBuffer();
  const data = new Deno.Buffer(buffer).bytes();

  try {
    await Deno.writeFile(path, data)
    log.debug("Writing", path);
  } catch (e) {
    log.error("Writing failed", path, e);
  }
}