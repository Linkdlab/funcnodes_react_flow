/*
 * Logger interface
 *
 * debug: log debug message
 * info: log info message
 * warn: log warning message
 * error: log error message
 * level: log level
 * set_level: set log level
 *
 * the log function take a string and arbitary number keyword arguments
 * the keyword arguments are used to format the string if needed
 * (lazy formatting)
 */

interface Logger {
  level: number;

  // Set the logging level
  set_level: (level: number) => void;

  // Log a debug message
  debug: (message: string, ...args: any[]) => void;

  // Log an info message
  info: (message: string, ...args: any[]) => void;

  // Log a warning message
  warn: (message: string, ...args: any[]) => void;

  // Log an error message
  error: (message: string, ...args: any[]) => void;
}

const LEVELS = {
  DEBUG: 0,
  INFO: 10,
  WARN: 20,
  ERROR: 30,
};

const DEBUG = LEVELS.DEBUG;
const INFO = LEVELS.INFO;
const WARN = LEVELS.WARN;
const ERROR = LEVELS.ERROR;

const level_to_string = (level: number | string) => {
  if (typeof level === "string") return level;
  if (level === LEVELS.DEBUG) return "DEBUG";
  if (level === LEVELS.INFO) return "INFO";
  if (level === LEVELS.WARN) return "WARN";
  if (level === LEVELS.ERROR) return "ERROR";
  return "UNKNOWN";
};

function getCircularReplacer() {
  const ancestors: any[] = [];
  return function (this: any, _key: any, value: any) {
    if (typeof value !== "object" || value === null) {
      return value;
    }
    // `this` is the object that value is contained in,
    // i.e., its direct parent.
    while (ancestors.length > 0 && ancestors.at(-1) !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(value)) {
      return "[Circular]";
    }
    ancestors.push(value);
    return value;
  };
}
const string_to_level = (level: string | number) => {
  if (typeof level === "number") return level;

  const level_lower = level.toLowerCase();
  if (level_lower === "debug") return LEVELS.DEBUG;
  if (level_lower === "info") return LEVELS.INFO;
  if (level_lower === "warn" || level_lower === "warning") return LEVELS.WARN;
  if (level_lower === "error") return LEVELS.ERROR;
  throw new Error(`Unknown log level: ${level}`);
};

class ConsoleLogger implements Logger {
  name: string;
  level: number;
  private _level_name: string;

  constructor(name: string, level: number | string = LEVELS.INFO) {
    this.name = name;
    this.level = string_to_level(level);
    this._level_name = level_to_string(level);
  }
  set_level(level: number) {
    this.level = level;
    this._level_name = level_to_string(level);
  }

  private _fomat_message(message: string, ...args: any[]) {
    return `[${this.name}] ${this._level_name}: ${message} ${args
      .map((a) => JSON.stringify(a, getCircularReplacer()))
      .join(" ")}`;
  }

  debug(message: string, ...args: any[]) {
    if (this.level <= LEVELS.DEBUG) {
      console.debug(this._fomat_message(message, ...args));
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LEVELS.INFO) {
      console.info(this._fomat_message(message, ...args));
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LEVELS.WARN) {
      console.warn(this._fomat_message(message, ...args));
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LEVELS.ERROR) {
      console.error(this._fomat_message(message, ...args));
    }
  }
}

export { ConsoleLogger, DEBUG, INFO, WARN, ERROR };
export type { Logger };
