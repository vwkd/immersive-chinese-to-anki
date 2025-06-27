# Immersive Chinese to Anki

Create Anki cards from Immersive Chinese content



## Motivation

Immersive Chinese essentially replicates a limited Anki set. Notably it lacks card search, tags instead of lists, and a spaced-repetition trainer. Although the UI of Immersive Chinese is certainly nicer, having the full features of Anki may help with learning.



## Requirements

- paid Immersive Chinese subscription
- deno
- browser with Webscraper.io extension



## Usage

### 1. Scrape data from Immersive Chinese

Open Immersive Chinese in browser and log in. Open Webscraper in Developer Tools, import the [sitemaps](sitemaps), scrape the data and export it as CSV.

Note, Webscraper has a free limit of 500 scrapes. In this case it isn't hit if you only do it once but if you repeat it multiple times you may want to delete and reinstall the extension. Note that Webscraper has no status messages and it might not be obvious if it succeeded or quit early.

Note, we don't scrape from the table directly since Webscraper can't parse tables without a header row. Setting it to the first row doesn't work because it changes on every page.

### 2. Convert data

Run the CLI app on the CSVs.

Provide the optional audio target directory argument to also download audio.

```sh
mkdir -p out/serial-course/audio
deno task run serial-course -d serial-course.csv -o out/serial-course -a out/serial-course/audio
mkdir -p out/vocabulary/audio
deno task run vocabulary -d vocabulary.csv -o out/vocabulary -a out/vocabulary/audio
mkdir -p out/pronunciation/audio
deno task run pronunciation -d pronunciation.csv -o out/pronunciation -a out/pronunciation/audio
```

Note, the target directory must already exist. Files that already exist are not overwritten. Audio files that already exist aren't downloaded again.

### 3. Import data into Anki

Import CSV files into Anki and move the audio files into Anki's media directory. Make sure to select the right Card Type, the right Deck, and confirm that the Field Mapping is correct. This will be the most laborious task for multiple CSV files.

You can create subdecks for each type of content and lesson, e.g. `IC::Serial Course::A::Lesson 1`, `IC::Pronunciation::Lesson 1`, etc.

You can create a new Card Type for each type of content (Serial Course, Vocabulary, Pronunciation). See [card-templates](card-templates) for an example that looks like Immersive Chinese and plays the fast audio on the front. Use it together with a new Deck Option that disables automatic audio playing. You can apply the Deck Option to all subdecks as well.

Note, Anki falsely reports unused Media if the audio field contains only the filepath and the `[sound: ..]` directive is in the Card Template.

Note, if AnkiWeb is used then the MP4 files have to be converted to MP3 since MP4 isn't supported. This can be done using [ffmpeg](https://stackoverflow.com/questions/38449239/converting-all-the-mp4-audio-files-in-a-folder-to-mp3-using-ffmpeg) and the filename in the Anki cards can be renamed in the Card Browser using Find and Replace, e.g. Find `(.+?)mp4`, replace with `${1}mp3`, in `Audio`, treat as regular expression.



## Architecture

The scraping relies on the fact that Immersive Chinese loads the data for an entire lesson and renders individual exercises only client-side.

The script downloading the audio relies on the fact that audio URLs are static and unprotected such that they can be fetched without authentication.



## Statistics

### Serial Course

- ~180 lessons: 160 lessons, 16 extra sentences, 9 extra stories
- ~4500 exercises: ~25 exercises per lesson
- ~6750 audio files: fast audio for every exercise, slow audio for about half

### Vocabulary

- ~930 entries with audio: about 1 for every 5 exercises

### Pronunciation

- 10 lessons
- ~250 exercises and audio files: ~25 exercises per lesson
