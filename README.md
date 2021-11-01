# README

Scrapes lessons from Immersive Chinese for Anki



## Stats

- 160 Lessons + 9 Extra Stories
- A lesson has usually (but not always) 25 Exercises
- 6000 Audios, fast audio for every exercise, for about half also slow



## Source

IC website is thankfully not very well designed which makes scraping straightforward. For a lesson it loads the full table with data of every exercise and does the card layout client side. The audio files are all at static URL unprotected without authentication.



## Usage

1. Scrape all exercises for each lesson into CSV

Use Webscraper.io Chrome extension with [sitemap](sitemaps/serial-course.json) for the config.

Note, doesn't scrape from table directly since Webscraper can't parse tables without a header row. Setting it to the first row doesn't work because it changes on every page.

2. Parse CSV, write CSV for every lesson, optionally download audios

Run `deno run -A src/serial-course/main.ts source.csv target_dir` to parse CSV and write CSV for every lesson.
Run `deno run -A src/serial-course/main.ts source.csv target_dir audio_target_dir` to also download audios.

Note, the target directories must already exist. Files that already exist are not overwritten. Audios that already exist aren't downloaded again.

3. Import into Anki

For every lesson create a new Deck and import the CSV file. Should use a subdeckname for ordering, e.g. `IC::A::Lesson 1`. This is the labor intensive part.

If AnkiWeb is used, then MP4 files have to be converted to MP3 since MP4 files aren't supported.

Also Anki falsely reports unused Media if the audio fields only contain the filepath and only the Card Template contains the `[sound: .. ]` directive.

The space in the filename is handled by Anki fine.
