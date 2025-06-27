import { getLogger } from "@logtape/logtape";

const log = getLogger(["ic-to-anki", "utilities"]);

export async function downloadFile(url: string, path: string): Promise<void> {
  log.debug(`Fetching ${url}`);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Got error ${res.status} ${res.statusText}.`);
  }

  if (!res.body) {
    throw new Error("Got empty body.");
  }

  const file = await Deno.create(path);

  await res.body.pipeTo(file.writable);
}
