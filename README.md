# Immersive Chinese to Anki

Tools for scraping Immersive Chinese content and create Anki cards.



## Why?

IC essentially replicates a limited Anki set. Notably it lacks card search, tags instead of lists, and a spaced-repetition trainer. Although the UI of IC is certainly nicer, having the full features of Anki may help in learning.



## Requirements

- paid IC subscription
- deno
- Chromium browser, e.g. Chrome, Brave, etc.
- Webscraper.io extension



## Usage


### 1. Scrape data from IC

Open Chromium browser, open IC and log in. Open Webscraper in Developer Tools, import a sitemap, scrape the data and export it as CSV.

Note, Webscraper has a free limit of 500 scrapes. In this case it isn't hit if you only do it once but if you repeat it multiple times you may want to delete and reinstall the extension. Note that Webscraper has no status messages and it might not be obvious if it succeeded or quit early.

Note, we don't scrape from the table directly since Webscraper can't parse tables without a header row. Setting it to the first row doesn't work because it changes on every page.


### 2. Convert data using scripts

Run the script on the CSV.

First two arguments are mandatory, CSV source file and CSV target directory. Third argument is optional, audio target directory. Note, downloads audio only if third argument is given.

```sh
mkdir -p mkdir dist/serial-course/audio
deno run --allow-read --allow-write --allow-net src/serial-course.js serial-course.csv dist/serial-course dist/serial-course/audio
```

```sh
mkdir -p dist/vocab/audio
deno run --allow-read --allow-write --allow-net src/vocab.js vocab.csv dist/vocab dist/vocab/audio
```

```sh
mkdir -p dist/pronounciation/audio
deno run --allow-read --allow-write --allow-net src/pronounciation.js pronounciation.csv dist/pronounciation dist/pronounciation/audio
```

Note, the target directory must already exist. Files that already exist are not overwritten. Audios that already exist aren't downloaded again.


### 3. Import data into Anki

Import CSV files into Anki and move the audio files into Anki's media directory. Make sure to select the right Card Type, the right Deck, and confirm that the Field Mapping is correct. This will be the most laborious task for multiple CSV files.

You can create a new Card Type for each type of content (Serial Course, Vocab, Pronounciation). See [docs](docs) for an example. Note, Anki falsely reports unused Media if the audio field contains only the filepath and the `[sound: ..]` directive is in the Card Template.

You can create subdecks for each type of content and lesson, e.g. `IC::Serial Course::A::Lesson 1`, `IC::Pronounciation::Lesson 1`, etc.

Note, if AnkiWeb is used then the MP4 files have to be converted to MP3 since MP4 isn't supported. This can be done using [ffmpeg](https://stackoverflow.com/questions/38449239/converting-all-the-mp4-audio-files-in-a-folder-to-mp3-using-ffmpeg) and the filename in the Anki cards can be renamed in the Card Browser using Find and Replace, e.g. Find `(.+?)mp4`, replace with `${1}mp3`, in `Audio`, treat as regular expression.



## Architecture

The scraping relies on the fact that IC loads the data for an entire lesson and renders individual exercises only client-side.

The script downloading the audios relies on the fact that audio URLs are static and unprotected such that they can be fetched without authentication.



## Statistics

### Serial Course

- ~180 lessons: 160 lessons, 16 extra sentences, 9 extra stories
- ~4500 exercises: ~25 exercises per lesson
- ~6750 audios: fast audio for every excercise, slow audio for about half

### Vocabulary

- ~930 entries with audio: about 1 for every 5 exercises

### Pronounciation

- 10 lessons
- ~250 exercises and audios: ~25 exercises per lesson
