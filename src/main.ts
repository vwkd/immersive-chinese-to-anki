import { Command } from "@cliffy/command";
import { configure, getConsoleSink } from "@logtape/logtape";
import serialCourseCommand from "./serial-course/main.ts";
import vocabularyCommand from "./vocabulary/main.ts";
import pronunciationCommand from "./pronunciation/main.ts";

await new Command()
  .name("ic-to-anki")
  .version("0.0.1")
  .description("Create Anki cards from Immersive Chinese content")
  .option("-v, --verbose", "Enable debug logging", { global: true })
  .globalAction(async (options) => {
    await configure({
      sinks: {
        console: getConsoleSink(),
      },
      loggers: [
        {
          category: ["ic-to-anki"],
          lowestLevel: options.verbose ? "debug" : "info",
          sinks: ["console"],
        },
        { category: ["logtape", "meta"], sinks: [] },
      ],
    });
  })
  .command("serial-course", serialCourseCommand)
  .command("vocabulary", vocabularyCommand)
  .command("pronunciation", pronunciationCommand)
  .parse(Deno.args);
