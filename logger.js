class Logger {

  constructor(level) {
    this.level = level.toLowerCase();
  }

  debug(...args) {
    if (levels.debug >= levels[this.level]) {
      console.log("DEBUG:", ...args);
    }
  }

  info(...args) {
    if (levels.info >= levels[this.level]) {
      console.log("INFO:", ...args);
    }
  }

  warning(...args) {
    if (levels.warning >= levels[this.level]) {
      console.log("WARNING:", ...args);
    }
  }

  error(...args) {
    if (levels.error >= levels[this.level]) {
      console.error("ERROR:", ...args);
    }
  }
}

const levels = {
  "debug": 1,
  "info": 2,
  "warning": 3,
  "error": 4,
}

export const log = new Logger("info");