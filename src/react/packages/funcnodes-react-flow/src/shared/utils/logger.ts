/**
 * Logger interface and utilities for structured logging across the application.
 *
 * This module provides a flexible logging system with multiple output targets
 * and configurable log levels. The logging interface supports lazy formatting
 * through keyword arguments and circular reference handling.
 *
 * @module Logger
 */

/**
 * Logger interface defining the contract for all logger implementations.
 *
 * The log functions take a string message and arbitrary number of keyword arguments
 * that are used for lazy formatting when the log level permits output.
 *
 * @interface Logger
 * @example
 * ```typescript
 * const logger: Logger = new ConsoleLogger("MyApp", INFO);
 * logger.info("User logged in", { userId: 123, timestamp: Date.now() });
 * logger.error("Database connection failed", error);
 * ```
 */
export interface Logger {
  /**
   * Current logging level. Messages below this level will be filtered out.
   * @type {number}
   */
  level: number;

  /**
   * Set the logging level for this logger instance.
   *
   * @param {number | string} level - The minimum log level to output (DEBUG=0, INFO=10, WARN=20, ERROR=30) or string level name
   * @example
   * ```typescript
   * logger.set_level(DEBUG); // Show all messages
   * logger.set_level("ERROR"); // Show only error messages
   * logger.set_level("debug"); // Case-insensitive string levels
   * ```
   */
  set_level: (level: number | string) => void;

  /**
   * Log a debug message. Only outputs if current level <= DEBUG.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
   * @example
   * ```typescript
   * logger.debug("Processing item", { itemId: 42, step: "validation" });
   * ```
   */
  debug: (message: string, ...args: any[]) => void;

  /**
   * Log an informational message. Only outputs if current level <= INFO.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
   * @example
   * ```typescript
   * logger.info("User action completed", { action: "save", duration: "120ms" });
   * ```
   */
  info: (message: string, ...args: any[]) => void;

  /**
   * Log a warning message. Only outputs if current level <= WARN.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional arguments for context (will be JSON serialized)
   * @example
   * ```typescript
   * logger.warn("Deprecated API usage", { api: "/old-endpoint", replacement: "/v2/endpoint" });
   * ```
   */
  warn: (message: string, ...args: any[]) => void;

  /**
   * Log an error message. Only outputs if current level <= ERROR.
   *
   * @param {string} message - The primary log message
   * @param {Error} [error] - Optional Error object for stack trace handling
   * @example
   * ```typescript
   * logger.error("Operation failed", error);
   * ```
   */
  error: (message: string, error?: Error) => void;
}

/**
 * Standard logging levels with numeric values for comparison.
 * Higher numbers indicate more severe/important messages.
 *
 * @constant {Object} LEVELS
 */
const LEVELS = {
  /** Debug level - most verbose, for development debugging */
  DEBUG: 0,
  /** Info level - general information about application flow */
  INFO: 10,
  /** Warning level - concerning but non-critical issues */
  WARN: 20,
  /** Error level - critical problems requiring attention */
  ERROR: 30,
};

/**
 * Debug log level constant (0).
 * @constant {number}
 */
export const DEBUG = LEVELS.DEBUG;

/**
 * Info log level constant (10).
 * @constant {number}
 */
export const INFO = LEVELS.INFO;

/**
 * Warning log level constant (20).
 * @constant {number}
 */
export const WARN = LEVELS.WARN;

/**
 * Error log level constant (30).
 * @constant {number}
 */
export const ERROR = LEVELS.ERROR;

/**
 * Convert a numeric log level to its string representation.
 *
 * @param {number | string} level - The log level to convert
 * @returns {string} The string representation of the log level
 * @example
 * ```typescript
 * level_to_string(0) // returns "DEBUG"
 * level_to_string(10) // returns "INFO"
 * level_to_string("DEBUG") // returns "DEBUG"
 * ```
 */
const level_to_string = (level: number | string) => {
  if (typeof level === "string") return level;
  if (level === LEVELS.DEBUG) return "DEBUG";
  if (level === LEVELS.INFO) return "INFO";
  if (level === LEVELS.WARN) return "WARN";
  if (level === LEVELS.ERROR) return "ERROR";
  return "UNKNOWN";
};

/**
 * Create a JSON replacer function that handles circular references.
 *
 * This function prevents JSON.stringify from throwing errors when
 * encountering circular object references by replacing them with "[Circular]".
 *
 * @returns {Function} A replacer function for JSON.stringify
 * @example
 * ```typescript
 * const obj = { a: 1 };
 * obj.self = obj; // Create circular reference
 * JSON.stringify(obj, getCircularReplacer()); // Won't throw error
 * ```
 */
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

/**
 * Convert a string log level to its numeric representation.
 *
 * @param {string | number} level - The log level to convert (case-insensitive)
 * @returns {number} The numeric log level
 * @throws {Error} When an unknown log level string is provided
 * @example
 * ```typescript
 * string_to_level("debug") // returns 0
 * string_to_level("INFO") // returns 10
 * string_to_level("warning") // returns 20
 * string_to_level(30) // returns 30
 * ```
 */
const string_to_level = (level: string | number) => {
  if (typeof level === "number") return level;

  const level_lower = level.toLowerCase();
  if (level_lower === "debug") return LEVELS.DEBUG;
  if (level_lower === "info") return LEVELS.INFO;
  if (level_lower === "warn" || level_lower === "warning") return LEVELS.WARN;
  if (level_lower === "error") return LEVELS.ERROR;
  throw new Error(`Unknown log level: ${level}`);
};

/**
 * Abstract base logger class providing common logging functionality.
 *
 * This class implements the Logger interface with shared logic for message formatting,
 * level checking, and timestamp handling. Concrete implementations must provide
 * the actual output methods.
 *
 * @abstract
 * @class BaseLogger
 * @implements {Logger}
 * @example
 * ```typescript
 * class CustomLogger extends BaseLogger {
 *   protected out_debug(msg: string) { console.log(`[DEBUG] ${msg}`); }
 *   protected out_info(msg: string) { console.log(`[INFO] ${msg}`); }
 *   protected out_warn(msg: string) { console.log(`[WARN] ${msg}`); }
 *   protected out_error(msg: string) { console.log(`[ERROR] ${msg}`); }
 * }
 * ```
 */
export abstract class BaseLogger implements Logger {
  /**
   * The name/identifier for this logger instance.
   * @type {string}
   */
  name: string;

  /**
   * Current numeric log level.
   * @type {number}
   */
  level: number;

  /**
   * String representation of the current log level.
   * @private
   * @type {string}
   */
  private _level_name: string;

  /**
   * Whether to include timestamps in log messages.
   * @type {boolean}
   */
  with_timestamp: boolean;

  /**
   * Create a new BaseLogger instance.
   *
   * @param {string} name - The name/identifier for this logger
   * @param {number | string} [level=LEVELS.INFO] - Initial log level
   * @param {boolean} [with_timestamp=true] - Whether to include timestamps
   * @example
   * ```typescript
   * const logger = new MyLogger("DatabaseService", "DEBUG", true);
   * ```
   */
  constructor(
    name: string,
    level: number | string = LEVELS.INFO,
    with_timestamp: boolean = true
  ) {
    this.name = name;
    this.level = string_to_level(level);
    this._level_name = level_to_string(this.level); // Use numeric level to ensure consistent naming
    this.with_timestamp = with_timestamp;
  }

  /**
   * Set the logging level for this logger instance.
   *
   * @param {number | string} level - The new log level (numeric or string)
   * @example
   * ```typescript
   * logger.set_level(DEBUG); // Enable debug logging
   * logger.set_level("debug"); // Same as above using string
   * ```
   */
  set_level(level: number | string) {
    if (typeof level === "string") {
      level = string_to_level(level);
    }
    this.level = level;
    this._level_name = level_to_string(this.level);
  }

  /**
   * Get the string representation of the current log level.
   *
   * @returns {string} The current log level as a string
   * @example
   * ```typescript
   * logger.level_name // "INFO"
   * ```
   */
  get level_name() {
    return this._level_name;
  }

  /**
   * Format a log message with level, timestamp, and arguments.
   *
   * @param {string} levelstring - The log level string (DEBUG, INFO, etc.)
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional arguments to include
   * @returns {string} The formatted log message
   * @example
   * ```typescript
   * // Returns: "12/25/2023, 10:30:15 AM [MyApp] INFO: User logged in {userId: 123}"
   * logger.format_message("INFO", "User logged in", {userId: 123});
   * ```
   */
  format_message(levelstring: string, message: string, ...args: any[]) {
    const timestamp = this.with_timestamp ? new Date().toLocaleString() : "";
    return `${timestamp} [${this.name}] ${levelstring}: ${message} ${args
      .map((a) => JSON.stringify(a, getCircularReplacer()))
      .join(" ")}`.trim();
  }

  /**
   * Output method for debug messages. Must be implemented by subclasses.
   *
   * @abstract
   * @protected
   * @param {string} formatted_message - The pre-formatted message to output
   */
  protected abstract out_debug(formatted_message: string): void;

  /**
   * Output method for info messages. Must be implemented by subclasses.
   *
   * @abstract
   * @protected
   * @param {string} formatted_message - The pre-formatted message to output
   */
  protected abstract out_info(formatted_message: string): void;

  /**
   * Output method for warning messages. Must be implemented by subclasses.
   *
   * @abstract
   * @protected
   * @param {string} formatted_message - The pre-formatted message to output
   */
  protected abstract out_warn(formatted_message: string): void;

  /**
   * Output method for error messages. Must be implemented by subclasses.
   *
   * @abstract
   * @protected
   * @param {string} formatted_message - The pre-formatted message to output
   * @param {Error | undefined} error - Optional Error object for stack trace handling
   */
  protected abstract out_error(formatted_message: string, error?: Error): void;

  /**
   * Log a debug message if the current level allows it.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional context arguments
   */
  debug(message: string, ...args: any[]) {
    if (this.level <= LEVELS.DEBUG) {
      this.out_debug(this.format_message("DEBUG", message, ...args));
    }
  }

  /**
   * Log an info message if the current level allows it.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional context arguments
   */
  info(message: string, ...args: any[]) {
    if (this.level <= LEVELS.INFO) {
      this.out_info(this.format_message("INFO", message, ...args));
    }
  }

  /**
   * Log a warning message if the current level allows it.
   *
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional context arguments
   */
  warn(message: string, ...args: any[]) {
    if (this.level <= LEVELS.WARN) {
      this.out_warn(this.format_message("WARN", message, ...args));
    }
  }

  /**
   * Log an error message if the current level allows it.
   *
   * @param {string} message - The primary log message
   * @param {Error} [error] - Optional Error object for stack trace handling
   */
  error(message: string, error?: Error) {
    if (this.level <= LEVELS.ERROR) {
      this.out_error(this.format_message("ERROR", message), error);
    }
  }
}

/**
 * Logger implementation that outputs to the browser console.
 *
 * This logger uses the standard console methods (console.debug, console.info, etc.)
 * to output formatted log messages. It's the most common logger for web applications.
 *
 * @class ConsoleLogger
 * @extends BaseLogger
 * @example
 * ```typescript
 * const logger = new ConsoleLogger("MyComponent", "DEBUG");
 * logger.info("Component mounted");
 * logger.error("Failed to load data", error);
 * ```
 */
export class ConsoleLogger extends BaseLogger {
  /**
   * Create a new ConsoleLogger instance.
   *
   * @param {string} name - The name/identifier for this logger
   * @param {number | string} [level=LEVELS.INFO] - Initial log level
   * @example
   * ```typescript
   * const logger = new ConsoleLogger("API", "WARN");
   * ```
   */
  constructor(name: string, level: number | string = LEVELS.INFO) {
    super(name, level);
  }

  /**
   * Output debug message to console.debug.
   *
   * @protected
   * @param {string} formatted_message - The formatted message to output
   */
  protected out_debug(formatted_message: string): void {
    console.debug(formatted_message);
  }

  /**
   * Output info message to console.info.
   *
   * @protected
   * @param {string} formatted_message - The formatted message to output
   */
  protected out_info(formatted_message: string): void {
    console.info(formatted_message);
  }

  /**
   * Output warning message to console.warn.
   *
   * @protected
   * @param {string} formatted_message - The formatted message to output
   */
  protected out_warn(formatted_message: string): void {
    console.warn(formatted_message);
  }

  /**
   * Output error message to console.error.
   *
   * @protected
   * @param {string} formatted_message - The formatted message to output
   * @param {Error | undefined} error - Optional Error object for stack trace handling
   */
  protected out_error(formatted_message: string, error?: Error): void {
    console.error(formatted_message);
    if (error) {
      console.error(error);
    }
  }
}

/**
 * Escape HTML special characters to prevent XSS vulnerabilities.
 *
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for HTML insertion
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>') // '&lt;script&gt;alert("xss")&lt;/script&gt;'
 * ```
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Logger implementation that outputs to an HTML div element.
 *
 * This logger appends formatted log messages as HTML elements to a specified div.
 * Each log level gets a CSS class for styling (debug, info, warn, error).
 * All content is automatically HTML-escaped during message formatting to prevent XSS vulnerabilities.
 * Useful for in-application log displays or debugging interfaces.
 *
 * @class DivLogger
 * @extends BaseLogger
 * @example
 * ```typescript
 * const logDiv = document.getElementById('log-output') as HTMLDivElement;
 * const logger = new DivLogger(logDiv, "UI", "DEBUG");
 * logger.info("User input: <script>alert('xss')</script>");
 * // Adds: <div class="info">timestamp [UI] INFO: User input: &lt;script&gt;alert('xss')&lt;/script&gt;</div>
 * ```
 */
export class DivLogger extends BaseLogger {
  /**
   * The HTML div element where log messages will be appended.
   * @private
   * @type {HTMLDivElement}
   */
  private _div: HTMLDivElement;

  /**
   * Create a new DivLogger instance.
   *
   * @param {HTMLDivElement} div - The HTML div element to append log messages to
   * @param {string} name - The name/identifier for this logger
   * @param {number | string} [level=LEVELS.INFO] - Initial log level
   * @example
   * ```typescript
   * const logContainer = document.createElement('div');
   * const logger = new DivLogger(logContainer, "WebWorker", "DEBUG");
   * ```
   */
  constructor(
    div: HTMLDivElement,
    name: string,
    level: number | string = LEVELS.INFO
  ) {
    super(name, level);
    this._div = div;
  }

  /**
   * Format a log message with HTML escaping for safe DOM insertion.
   *
   * Overrides the base implementation to automatically escape HTML content,
   * preventing XSS vulnerabilities when displaying logs in web interfaces.
   *
   * @param {string} levelstring - The log level string (DEBUG, INFO, etc.)
   * @param {string} message - The primary log message
   * @param {...any[]} args - Additional arguments to include
   * @returns {string} The formatted and HTML-escaped log message
   * @example
   * ```typescript
   * // Input: "User input: <script>alert('xss')</script>"
   * // Output: "12/25/2023, 10:30:15 AM [UI] INFO: User input: &lt;script&gt;alert('xss')&lt;/script&gt;"
   * ```
   */
  format_message(levelstring: string, message: string, ...args: any[]) {
    return escapeHtml(super.format_message(levelstring, message, ...args));
  }

  /**
   * Output debug message as HTML div with 'debug' class.
   *
   * @protected
   * @param {string} formatted_message - The pre-formatted and HTML-escaped message to output
   */
  protected out_debug(formatted_message: string): void {
    this._div.innerHTML += `<div class="debug">${formatted_message}</div>`;
  }

  /**
   * Output info message as HTML div with 'info' class.
   *
   * @protected
   * @param {string} formatted_message - The pre-formatted and HTML-escaped message to output
   */
  protected out_info(formatted_message: string): void {
    this._div.innerHTML += `<div class="info">${formatted_message}</div>`;
  }

  /**
   * Output warning message as HTML div with 'warn' class.
   *
   * @protected
   * @param {string} formatted_message - The pre-formatted and HTML-escaped message to output
   */
  protected out_warn(formatted_message: string): void {
    this._div.innerHTML += `<div class="warn">${formatted_message}</div>`;
  }

  /**
   * Output error message as HTML div with 'error' class.
   *
   * @protected
   * @param {string} formatted_message - The pre-formatted and HTML-escaped message to output
   * @param {Error | undefined} error - Optional Error object for stack trace handling
   */
  protected out_error(formatted_message: string, error?: Error): void {
    let errorContent = formatted_message;
    if (error) {
      const stackTrace = error.stack ? escapeHtml(error.stack) : escapeHtml(error.message);
      errorContent += `<br><pre>${stackTrace}</pre>`;
    }
    this._div.innerHTML += `<div class="error">${errorContent}</div>`;
  }
}
