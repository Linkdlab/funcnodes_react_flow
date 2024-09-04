const DEBUG = 0;
const INFO = 10;
const WARN = 20;
const ERROR = 30;

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

class ConsoleLogger implements Logger {
  name: string;
  level: number;

  constructor(name: string, level: number = INFO) {
    this.name = name;
    this.level = level;
  }
  set_level(level: number) {
    this.level = level;
  }

  get debug() {
    if (this.level <= DEBUG)
      return console.debug.bind(console, `[${this.name}]`, "DEBUG:");
    return () => {};
  }
  get info() {
    if (this.level <= INFO) {
      return console.info.bind(console, `[${this.name}]`, "INFO:");
    }
    return () => {};
  }
  get warn() {
    if (this.level <= WARN) {
      return console.warn.bind(console, `[${this.name}]`, "WARN:");
    }
    return () => {};
  }
  get error() {
    if (this.level <= ERROR) {
      return console.error.bind(console, `[${this.name}]`, "ERROR:");
    }
    return () => {};
  }
}

export { ConsoleLogger, DEBUG, INFO, WARN, ERROR };
export type { Logger };
