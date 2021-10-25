# README

Scrapes lessons from Immersive Chinese for Anki



## Stats

- 160 Lessons + 9 Extra Stories
- A lesson has usually (but not always) 25 Exercises
- 6000 Audios, fast audio for every exercise, for about half also slow



## Source

IC website is thankfully not very well designed which makes scraping straightforward. For a lesson it loads the full table with data of every exercise and does the card layout client side. The audio files are all at static URL unprotected without authentication.



## Usage

1. Scrape raw HTML table of all exercises for each lesson into CSV

Use Webscraper.io Chrome extension with [sitemap](sitemaps/serial-course.json) for the config.

Webscraper can parse tables. But unfortunately not without a header row. Setting it to the first row doesn't work because it changes on every page. Therefore must scrape the raw HTML of the table and do own parsing.

2. Parse CSV, parse HTML, output CSVs

Run `deno run -A src/serial-course/main.ts`.

The script parses the CSV, extracts the columns `name` and `table`, parses the HTML in the `table` column for every lesson. Then it writes a CSV for every lesson with the columns: `"id", "pinyin", "simplified", "traditional", "translation", "audio", "audioSlow"`
- downloads audio for every lesson

3. Import into Anki

For every lesson create a new Deck and import the CSV file. Should use a subdeckname for ordering, e.g. `IC::A::Lesson 1`. This is the labor intensive part.

If AnkiWeb is used, then MP4 files have to be converted to MP3 since MP4 files aren't supported.

Also Anki falsely reports unused Media if the audio fields only contain the filepath and only the Card Template contains the `[sound: .. ]` directive.

The space in the filename is handled by Anki fine.



## TODO

- Doesn't scrape the notes on the exercises. They seem to not be in the table. Would need to paginate through.
