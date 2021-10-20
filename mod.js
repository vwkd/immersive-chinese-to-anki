import { Logger } from "./logger.js"
import { BufReader } from "https://deno.land/std@0.112.0/io/mod.ts";
import { parse as parseCsv, stringify as stringifyCsv } from "https://deno.land/std@0.112.0/encoding/csv.ts";
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.15-alpha/deno-dom-wasm.ts";
import { join, basename } from "https://deno.land/std@0.112.0/path/mod.ts";

const SOURCE_CSV = "ex.csv";
const TARGET_AUDIO_DIR = "audios";
const TARGET_CSV_DIR = "csv";
const DOWNLOAD_DELAY = 100000;

const log = new Logger("info");
const parsed = await loadLessonsCsv(SOURCE_CSV);
const lessons = await processLessons(parsed);
await writeLessonsCsv(lessons);
await downloadAudios(lessons);

/**
 * Load lessons from CSV
 */
async function loadLessonsCsv(path) {
  const file = await Deno.open(path);
  const input = new BufReader(file);
  const content = await parseCsv(input, {
    skipFirstRow: true, columns: ["web-scraper-order", "web-scraper-start-url", "name", "href", "table"]
  });
  Deno.close(file.rid);
  return content;
}

/**
 * Process lessons
 * columns: name, table
 */
async function processLessons(parsed) {
  log.info(`Processing lessons...`);

  const lessons = [];

  for (const { name, table } of parsed) {
    const lesson = {};

    // get name without pinyin words
    const regex = /^(.+)\n/;
    const nameClean = name.match(regex)[1];
    lesson.name = nameClean;
    log.debug("Processing lesson:", nameClean);

    const content = await processTable("<table>" + table + "</table");
    if (content.length != 25) {
      log.warning(`Lesson has ${content.length} excercises instead of 25`);
    }
    lesson.content = content;

    lessons.push(lesson);
    // console.log(lesson);
  }

  return lessons;
}

/**
 * Parse lesson from HTML table
 * tbody
 *  tr -> ATTRIBUTE data-audio-slow, data-audio-fast
 *    td -> TEXT id
 *    td label -> TEXT pinyin
 *    td label -> TEXT simplified
 *    td label -> TEXT english
 *  ...
 */
async function processTable(html) {
  const lesson = [];

  const doc = new DOMParser().parseFromString(html, "text/html");

  const rows = doc.querySelectorAll("table > tbody > tr")
  for (const row of rows) {
    const excercise = {};
    excercise.audioUrls = getAudioUrls(row)
    const cols = row.querySelectorAll("td")
    excercise.content = getExcercise(cols);
    lesson.push(excercise);
  }

  return lesson;
}

/**
 * Get audio URLs
 * Slow is duplicate of fast if not available
 */
function getAudioUrls(tr) {
  const audioUrls = {};

  const lessonNumber = tr.getAttribute("data-toastr-text");
  audioUrls.lessonNumber = lessonNumber;

  const fastAudioUrl = tr.getAttribute("data-audio-fast");
  if (fastAudioUrl == "") {
    throw new Error(`Fast audio URL shouldn't be empty in ${lessonNumber}`);
  }
  audioUrls.fastAudioUrl = fastAudioUrl;

  let slowAudioUrl = tr.getAttribute("data-audio-slow");
  if (slowAudioUrl == "") {
    throw new Error(`Slow audio URL shouldn't be empty in ${lessonNumber}`);
  }
  if (fastAudioUrl == slowAudioUrl) {
    slowAudioUrl = "";
    log.debug(lessonNumber, `missing slow audio in ${lessonNumber}`);
  }
  audioUrls.slowAudioUrl = slowAudioUrl;

  return audioUrls;
}

function getExcercise(tds) {
  const content = {};

  for (const td of tds) {
    const label = td.querySelector("label");

    if (!label) {
      log.debug("ID");
      const text = td.textContent.trim();
      if (text == "") {
        throw new Error("id shouldn't be empty");
      }
      content.id = text;
    }

    else {
      if (label.classList.contains("show_pinyin_text")) {
        log.debug("Pinyin")
        const text = label.textContent.trim();
        if (text == "") {
          throw new Error("pinyin shouldn't be empty");
        }
        content.pinyin = text;

      } else if (label.classList.contains("show_simplified_characters_text")) {
        log.debug("Simplified")
        const text = label.textContent.trim();
        if (text == "") {
          throw new Error("simplified shouldn't be empty");
        }
        content.simplified = text;

      } else if (label.classList.contains("show_traditional_characters_text")) {
        log.debug("Traditional")
        const text = label.textContent.trim();
        if (text == "") {
          throw new Error("traditional shouldn't be empty");
        }
        content.traditional = text;

      } else if (label.classList.contains("show_translation_characters_text")) {
        log.debug("Translation");
        const text = label.textContent.trim();
        if (text == "") {
          throw new Error("translation shouldn't be empty");
        }
        content.translation = text;
      }

    }
  }

  return content;
}

async function writeLessonsCsv(lessons) {
  log.info(`Writing lessons to ${TARGET_CSV_DIR}...`);

  for (const { name, content } of lessons) {
    log.debug(`Writing lesson: ${name}...`);

    const lessonPath = join(TARGET_CSV_DIR, name + ".csv")

    const lessonPolished = [];

    for (const { audioUrls: { slowAudioUrl, fastAudioUrl }, content: { id, pinyin, simplified, traditional, translation, } } of content) {

      // todo: test if basename works with URLs
      const audio = basename(fastAudioUrl);
      const audioSlow = basename(slowAudioUrl);

      lessonPolished.push({
        id,
        pinyin,
        simplified,
        traditional,
        translation,
        audio,
        audioSlow,
      })
    }

    const csvString = await stringifyCsv(lessonPolished, [
      "id",
      "pinyin",
      "simplified",
      "traditional",
      "translation",
      "audio",
      "audioSlow",
    ]);
    await Deno.writeTextFile(lessonPath, csvString);
  }
}

async function downloadAudios(lessons) {
  log.info(`Downloading audios every ${DOWNLOAD_DELAY / 1000} seconds...`);

  for (const { name, content } of lessons) {
    log.info(`Downloading lesson: ${name}...`)
    for (const { audioUrls: { slowAudioUrl, fastAudioUrl }, content: { id } } of content) {
      log.info(`Downloading excercise ${id}...`)
      const timeout = delay(DOWNLOAD_DELAY);

      const fastAudioPath = join(TARGET_AUDIO_DIR, basename(fastAudioUrl));

      if (!await exists(fastAudioPath)) {
        log.info(`Downloading fast audio`);
        const blob = await fetchFile(fastAudioUrl);
        await writeFile(fastAudioPath, blob);
      }

      if (slowAudioUrl != "") {
        const slowAudioPath = join(TARGET_AUDIO_DIR, basename(slowAudioUrl));

        if (!await exists(slowAudioPath)) {
          log.info(`Downloading slow audio`);
          const blob = await fetchFile(slowAudioUrl);
          await writeFile(slowAudioPath, blob);
        }

      }

      await timeout;
    }
  }
}

async function fetchFile(url) {
  try {
    const res = await fetch(url);
    log.debug("Fetch", url);
    if (!res.ok) {
      log.error("HTTP failed", res.url, res.status, res.statusText)
    }
    return await res.blob();
  } catch (e) {
    log.error("Network failed OR blob decoding failed", e)
  }
}

async function writeFile(path, blob) {
  const buffer = await blob.arrayBuffer();
  const data = new Deno.Buffer(buffer).bytes();

  try {
    await Deno.writeFile(path, data)
    log.debug("Write", path);
  } catch (e) {
    log.error("Write failed", path, e);
  }
}

async function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  })
}

async function exists(path) {
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