# Immersive Chinese to Anki

Tools to scrape serial courses and vocabulary from Immersive Chinese and create cards in Anki. Anki benefits include a card search, tags instead of lists, and a spaced-repetition trainer.



## Requirements

- paid IC subscription
- deno
- Chromium browser, e.g. Chrome, Brave, etc.
- Webscraper.io extension



## Usage

### 1. Scrape data from IC

Open Webscraper, import a sitemap, log into IC, scrape the data and export it as CSV.

Note, Webscraper has a free limit of 500 scrapes. In this case it isn't hit if you only do it once but if you repeat it multiple times you may want to delete and reinstall the extension. Note that Webscraper has no status messages and it might not be obvious if it succeeded or quit early.

Note, doesn't scrape from table directly since Webscraper can't parse tables without a header row. Setting it to the first row doesn't work because it changes on every page.

### 2. Convert data using scripts

Run the script on the CSV. Mandatory arguments: CSV source file, CSV target directory. Optional argument: audio target directory

```sh
mkdir -p mkdir dist/serial-course/audio
deno run --allow-read --allow-write --allow-net src/serial-course.js serial-course.csv dist/serial-course dist/serial-course/audio
```

```sh
mkdir -p dist/vocab/audio
deno run --allow-read --allow-write --allow-net src/vocab.js vocab.csv dist/vocab dist/vocab/audio
```

Note, the target directory must already exist. Files that already exist are not overwritten. Audios that already exist aren't downloaded again.

### 3. Import data into Anki

- Create a new Card Type for all IC cards
- Import CSV, create a new Subdeck for each lesson, e.g. `IC::A::Lesson 1`. Make sure to select the right Card Type, the right Deck, and confirm that the Field Mapping is correct.
- Move audio files into Anki's media directory

For a Card Template see [docs](docs).

Note, if AnkiWeb is used, then the MP4 files have to be converted to MP3 since MP4 isn't supported. This can be done using [ffmpeg](https://stackoverflow.com/questions/38449239/converting-all-the-mp4-audio-files-in-a-folder-to-mp3-using-ffmpeg) and the filename in the Anki cards can be renamed in the Card Browser using Find and Replace, e.g. Find `(.+?)mp4`, replace with `${1}mp3`, in `Audio`, treat as regular expression.

Note, Anki falsely reports unused Media if the audio field contains only the filepath and the `[sound: ..]` directive is in the Card Template.

For every lesson create a new Deck and import the CSV file. Should use a subdeckname for ordering, e.g. `IC::A::Lesson 1`. This is the labor intensive part.



## Architecture

IC website is thankfully very simple. It loads the data for an entire lesson such that it can be easily scraped. Also the audio URLs are static and unprotected such that the script can fetch them without authentication.



## Statistics

### Serial Course

- ~180 lessons: 160 lessons, 16 extra sentences, 9 extra stories
- ~4500 exercises: ~25 exercises per lesson
- ~6750 audios: fast audio for every excercise, slow audio for about half

### Vocabulary

- ~930 entries with audio: about 1 for every 5 exercises
