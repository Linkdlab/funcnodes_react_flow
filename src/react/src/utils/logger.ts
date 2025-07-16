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

export interface Logger {
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

export const DEBUG = LEVELS.DEBUG;
export const INFO = LEVELS.INFO;
export const WARN = LEVELS.WARN;
export const ERROR = LEVELS.ERROR;

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

export abstract class BaseLogger implements Logger {
  name: string;
  level: number;
  private _level_name: string;
  with_timestamp: boolean;
  constructor(
    name: string,
    level: number | string = LEVELS.INFO,
    with_timestamp: boolean = true
  ) {
    this.name = name;
    this.level = string_to_level(level);
    this._level_name = level_to_string(level);
    this.with_timestamp = with_timestamp;
  }

  set_level(level: number) {
    this.level = level;
    this._level_name = level_to_string(level);
  }

  get level_name() {
    return this._level_name;
  }

  format_message(levelstring: string, message: string, ...args: any[]) {
    const timestamp = this.with_timestamp ? new Date().toLocaleString() : "";
    return `${timestamp} [${this.name}] ${levelstring}: ${message} ${args
      .map((a) => JSON.stringify(a, getCircularReplacer()))
      .join(" ")}`.trim();
  }

  // Abstract methods that child classes must implement
  protected abstract out_debug(formatted_message: string): void;
  protected abstract out_info(formatted_message: string): void;
  protected abstract out_warn(formatted_message: string): void;
  protected abstract out_error(formatted_message: string): void;

  debug(message: string, ...args: any[]) {
    if (this.level <= LEVELS.DEBUG) {
      this.out_debug(this.format_message("DEBUG", message, ...args));
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level <= LEVELS.INFO) {
      this.out_info(this.format_message("INFO", message, ...args));
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level <= LEVELS.WARN) {
      this.out_warn(this.format_message("WARN", message, ...args));
    }
  }

  error(message: string, ...args: any[]) {
    if (this.level <= LEVELS.ERROR) {
      this.out_error(this.format_message("ERROR", message, ...args));
    }
  }
}

export class ConsoleLogger extends BaseLogger {
  constructor(name: string, level: number | string = LEVELS.INFO) {
    super(name, level);
  }

  protected out_debug(formatted_message: string): void {
    console.debug(formatted_message);
  }

  protected out_info(formatted_message: string): void {
    console.info(formatted_message);
  }

  protected out_warn(formatted_message: string): void {
    console.warn(formatted_message);
  }

  protected out_error(formatted_message: string): void {
    console.error(formatted_message);
  }
}

export class DivLogger extends BaseLogger {
  private _div: HTMLDivElement;

  constructor(
    div: HTMLDivElement,
    name: string,
    level: number | string = LEVELS.INFO
  ) {
    super(name, level);
    this._div = div;
  }

  protected out_debug(formatted_message: string): void {
    this._div.innerHTML += `<div class="debug">${formatted_message}</div>`;
  }

  protected out_info(formatted_message: string): void {
    this._div.innerHTML += `<div class="info">${formatted_message}</div>`;
  }

  protected out_warn(formatted_message: string): void {
    this._div.innerHTML += `<div class="warn">${formatted_message}</div>`;
  }

  protected out_error(formatted_message: string): void {
    this._div.innerHTML += `<div class="error">${formatted_message}</div>`;
  }
}
