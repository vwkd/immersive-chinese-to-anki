## README

Scrapes lessons from Immersive Chinese



## Architecture

Uses content scraped using Webscraper.io extension into a CSV file. Relies on audio files being unprotected such that they can be downloaded without authentication.

- parses CSV
  extracts columns `name` and `table`
- parses HTML of every lesson
- writes CSV for every lesson
  columns: `"id", "pinyin", "simplified", "traditional", "translation", "audio", "audioSlow"`
- downloads audio for every lesson



## TODO

- add notes
  scrape again, parse from input file, add to output file
- Anki filename with space? Should use prefix?