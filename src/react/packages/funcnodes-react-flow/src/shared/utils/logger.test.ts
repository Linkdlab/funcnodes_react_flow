/**
 * @fileoverview Comprehensive tests for the logger module.
 *
 * Tests cover:
 * - Logger interface compliance
 * - Log level constants and conversions
 * - BaseLogger abstract class functionality
 * - ConsoleLogger implementation
 * - DivLogger implementation
 * - Message formatting and filtering
 * - Circular reference handling
 * - Error cases and edge scenarios
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  MockInstance,
} from "vitest";
import {
  BaseLogger,
  ConsoleLogger,
  DivLogger,
  DEBUG,
  INFO,
  WARN,
  ERROR,
} from "./logger";

// Test implementation of BaseLogger for testing abstract class
class TestLogger extends BaseLogger {
  public debugMessages: string[] = [];
  public infoMessages: string[] = [];
  public warnMessages: string[] = [];
  public errorMessages: string[] = [];

  protected out_debug(formatted_message: string): void {
    this.debugMessages.push(formatted_message);
  }

  protected out_info(formatted_message: string): void {
    this.infoMessages.push(formatted_message);
  }

  protected out_warn(formatted_message: string): void {
    this.warnMessages.push(formatted_message);
  }

  protected out_error(formatted_message: string): void {
    this.errorMessages.push(formatted_message);
  }

  // Helper methods for testing
  getAllMessages(): string[] {
    return [
      ...this.debugMessages,
      ...this.infoMessages,
      ...this.warnMessages,
      ...this.errorMessages,
    ];
  }

  clearMessages(): void {
    this.debugMessages = [];
    this.infoMessages = [];
    this.warnMessages = [];
    this.errorMessages = [];
  }
}

describe("Logger Constants", () => {
  it("should have correct log level values", () => {
    expect(DEBUG).toBe(0);
    expect(INFO).toBe(10);
    expect(WARN).toBe(20);
    expect(ERROR).toBe(30);
  });

  it("should have ascending log level hierarchy", () => {
    expect(DEBUG).toBeLessThan(INFO);
    expect(INFO).toBeLessThan(WARN);
    expect(WARN).toBeLessThan(ERROR);
  });
});

describe("BaseLogger", () => {
  let logger: TestLogger;

  beforeEach(() => {
    logger = new TestLogger("TestLogger", INFO);
  });

  afterEach(() => {
    logger.clearMessages();
  });

  describe("Constructor", () => {
    it("should initialize with default values", () => {
      const defaultLogger = new TestLogger("Default");
      expect(defaultLogger.name).toBe("Default");
      expect(defaultLogger.level).toBe(INFO);
      expect(defaultLogger.level_name).toBe("INFO");
      expect(defaultLogger.with_timestamp).toBe(true);
    });

    it("should initialize with string log level", () => {
      const debugLogger = new TestLogger("Debug", "debug");
      expect(debugLogger.level).toBe(DEBUG);
      expect(debugLogger.level_name).toBe("DEBUG");
    });

    it("should initialize with numeric log level", () => {
      const warnLogger = new TestLogger("Warn", WARN);
      expect(warnLogger.level).toBe(WARN);
      expect(warnLogger.level_name).toBe("WARN");
    });

    it("should initialize with custom timestamp setting", () => {
      const noTimestampLogger = new TestLogger("NoTime", INFO, false);
      expect(noTimestampLogger.with_timestamp).toBe(false);
    });

    it("should throw error for invalid string log level", () => {
      expect(() => {
        new TestLogger("Invalid", "invalid_level");
      }).toThrow("Unknown log level: invalid_level");
    });
  });

  describe("Level Management", () => {
    it("should set log level correctly", () => {
      logger.set_level(DEBUG);
      expect(logger.level).toBe(DEBUG);
      expect(logger.level_name).toBe("DEBUG");
    });

    it("should update level name when level changes", () => {
      logger.set_level(ERROR);
      expect(logger.level_name).toBe("ERROR");
    });
  });

  describe("Message Formatting", () => {
    beforeEach(() => {
      // Mock Date.prototype.toLocaleString for consistent testing
      vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
        "2023-12-25, 10:30:15 AM"
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should format message with timestamp", () => {
      const formatted = logger.format_message("INFO", "Test message");
      expect(formatted).toBe(
        "2023-12-25, 10:30:15 AM [TestLogger] INFO: Test message"
      );
    });

    it("should format message without timestamp", () => {
      const noTimeLogger = new TestLogger("NoTime", INFO, false);
      const formatted = noTimeLogger.format_message("INFO", "Test message");
      expect(formatted).toBe("[NoTime] INFO: Test message");
    });

    it("should format message with arguments", () => {
      const formatted = logger.format_message(
        "INFO",
        "User action",
        { userId: 123 },
        "extra"
      );
      expect(formatted).toBe(
        '2023-12-25, 10:30:15 AM [TestLogger] INFO: User action {"userId":123} "extra"'
      );
    });

    it("should handle circular references in arguments", () => {
      const obj: any = { name: "test" };
      obj.self = obj; // Create circular reference

      const formatted = logger.format_message("INFO", "Circular test", obj);
      expect(formatted).toContain("[Circular]");
    });

    it("should handle null and undefined arguments", () => {
      const formatted = logger.format_message(
        "INFO",
        "Null test",
        null,
        undefined
      );
      expect(formatted).toBe(
        "2023-12-25, 10:30:15 AM [TestLogger] INFO: Null test null"
      );
    });
  });

  describe("Logging Methods", () => {
    it("should log debug messages when level allows", () => {
      logger.set_level(DEBUG);
      logger.debug("Debug message", { data: "test" });

      expect(logger.debugMessages).toHaveLength(1);
      expect(logger.debugMessages[0]).toContain("DEBUG: Debug message");
      expect(logger.debugMessages[0]).toContain('{"data":"test"}');
    });

    it("should not log debug messages when level is too high", () => {
      logger.set_level(INFO);
      logger.debug("Debug message");

      expect(logger.debugMessages).toHaveLength(0);
    });

    it("should log info messages when level allows", () => {
      logger.set_level(INFO);
      logger.info("Info message");

      expect(logger.infoMessages).toHaveLength(1);
      expect(logger.infoMessages[0]).toContain("INFO: Info message");
    });

    it("should not log info messages when level is too high", () => {
      logger.set_level(WARN);
      logger.info("Info message");

      expect(logger.infoMessages).toHaveLength(0);
    });

    it("should log warn messages when level allows", () => {
      logger.set_level(WARN);
      logger.warn("Warning message");

      expect(logger.warnMessages).toHaveLength(1);
      expect(logger.warnMessages[0]).toContain("WARN: Warning message");
    });

    it("should not log warn messages when level is too high", () => {
      logger.set_level(ERROR);
      logger.warn("Warning message");

      expect(logger.warnMessages).toHaveLength(0);
    });

    it("should log error messages when level allows", () => {
      logger.set_level(ERROR);
      logger.error("Error message");

      expect(logger.errorMessages).toHaveLength(1);
      expect(logger.errorMessages[0]).toContain("ERROR: Error message");
    });

    it("should always log error messages regardless of level", () => {
      // ERROR is the highest level, so it should always log
      logger.set_level(ERROR);
      logger.error("Error message");

      expect(logger.errorMessages).toHaveLength(1);
    });

    it("should log multiple arguments correctly", () => {
      logger.set_level(DEBUG);
      const error = new Error("Test error");
      logger.debug(
        "Complex message",
        { userId: 123 },
        error,
        "additional info"
      );

      expect(logger.debugMessages[0]).toContain('{"userId":123}');
      expect(logger.debugMessages[0]).toContain('"additional info"');
    });
  });

  describe("Level Filtering", () => {
    beforeEach(() => {
      logger.set_level(INFO);
    });

    it("should filter messages based on current level", () => {
      logger.debug("Should not appear");
      logger.info("Should appear");
      logger.warn("Should appear");
      logger.error("Should appear");

      expect(logger.debugMessages).toHaveLength(0);
      expect(logger.infoMessages).toHaveLength(1);
      expect(logger.warnMessages).toHaveLength(1);
      expect(logger.errorMessages).toHaveLength(1);
    });
  });
});

describe("ConsoleLogger", () => {
  let logger: ConsoleLogger;
  let consoleSpies: {
    debug: MockInstance;
    info: MockInstance;
    warn: MockInstance;
    error: MockInstance;
  };

  beforeEach(() => {
    // Mock console methods
    consoleSpies = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    logger = new ConsoleLogger("ConsoleTest", DEBUG);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call console.debug for debug messages", () => {
    logger.debug("Debug message");
    expect(consoleSpies.debug).toHaveBeenCalledWith(
      expect.stringContaining("DEBUG: Debug message")
    );
  });

  it("should call console.info for info messages", () => {
    logger.info("Info message");
    expect(consoleSpies.info).toHaveBeenCalledWith(
      expect.stringContaining("INFO: Info message")
    );
  });

  it("should call console.warn for warn messages", () => {
    logger.warn("Warning message");
    expect(consoleSpies.warn).toHaveBeenCalledWith(
      expect.stringContaining("WARN: Warning message")
    );
  });

  it("should call console.error for error messages", () => {
    logger.error("Error message");
    expect(consoleSpies.error).toHaveBeenCalledWith(
      expect.stringContaining("ERROR: Error message")
    );
  });

  it("should respect log level filtering", () => {
    logger.set_level(WARN);

    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warning message");
    logger.error("Error message");

    expect(consoleSpies.debug).not.toHaveBeenCalled();
    expect(consoleSpies.info).not.toHaveBeenCalled();
    expect(consoleSpies.warn).toHaveBeenCalledOnce();
    expect(consoleSpies.error).toHaveBeenCalledOnce();
  });

  it("should initialize with default INFO level", () => {
    const defaultLogger = new ConsoleLogger("Default");
    expect(defaultLogger.level).toBe(INFO);
  });
});

describe("DivLogger", () => {
  let logger: DivLogger;
  let div: HTMLDivElement;

  beforeEach(() => {
    // Create a mock div element
    div = document.createElement("div");
    logger = new DivLogger(div, "DivTest", DEBUG);
  });

  it("should append debug messages to div with debug class", () => {
    logger.debug("Debug message");

    expect(div.innerHTML).toContain('<div class="debug">');
    expect(div.innerHTML).toContain("DEBUG: Debug message");
  });

  it("should append info messages to div with info class", () => {
    logger.info("Info message");

    expect(div.innerHTML).toContain('<div class="info">');
    expect(div.innerHTML).toContain("INFO: Info message");
  });

  it("should append warn messages to div with warn class", () => {
    logger.warn("Warning message");

    expect(div.innerHTML).toContain('<div class="warn">');
    expect(div.innerHTML).toContain("WARN: Warning message");
  });

  it("should append error messages to div with error class", () => {
    logger.error("Error message");

    expect(div.innerHTML).toContain('<div class="error">');
    expect(div.innerHTML).toContain("ERROR: Error message");
  });

  it("should accumulate multiple messages", () => {
    logger.info("First message");
    logger.warn("Second message");

    expect(div.innerHTML).toContain("First message");
    expect(div.innerHTML).toContain("Second message");
    expect(div.querySelectorAll("div")).toHaveLength(2);
  });

  it("should respect log level filtering", () => {
    logger.set_level(WARN);

    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warning message");

    expect(div.innerHTML).not.toContain("Debug message");
    expect(div.innerHTML).not.toContain("Info message");
    expect(div.innerHTML).toContain("Warning message");
  });

  it("should handle HTML escaping in messages", () => {
    logger.info('Message with <script>alert("xss")</script>');

    // The message should be safely inserted
    expect(div.innerHTML).toContain("&lt;script&gt;");
  });
});

describe("Logger Interface Compliance", () => {
  describe("TestLogger", () => {
    let logger: TestLogger;

    beforeEach(() => {
      logger = new TestLogger("Test", INFO);
    });

    it("should implement Logger interface", () => {
      expect(typeof logger.level).toBe("number");
      expect(typeof logger.set_level).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should handle set_level correctly", () => {
      const originalLevel = logger.level;
      logger.set_level(DEBUG);
      expect(logger.level).toBe(DEBUG);
      logger.set_level(originalLevel);
    });

    it("should handle all log methods without errors", () => {
      expect(() => {
        logger.debug("Debug test");
        logger.info("Info test");
        logger.warn("Warn test");
        logger.error("Error test");
      }).not.toThrow();
    });
  });

  describe("ConsoleLogger", () => {
    let logger: ConsoleLogger;

    beforeEach(() => {
      logger = new ConsoleLogger("Console", INFO);
    });

    it("should implement Logger interface", () => {
      expect(typeof logger.level).toBe("number");
      expect(typeof logger.set_level).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should handle set_level correctly", () => {
      const originalLevel = logger.level;
      logger.set_level(DEBUG);
      expect(logger.level).toBe(DEBUG);
      logger.set_level(originalLevel);
    });

    it("should handle all log methods without errors", () => {
      // Suppress console output for this test
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        logger.debug("Debug test");
        logger.info("Info test");
        logger.warn("Warn test");
        logger.error("Error test");
      }).not.toThrow();

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe("DivLogger", () => {
    let logger: DivLogger;
    let div: HTMLDivElement;

    beforeEach(() => {
      div = document.createElement("div");
      logger = new DivLogger(div, "Div", INFO);
    });

    it("should implement Logger interface", () => {
      expect(typeof logger.level).toBe("number");
      expect(typeof logger.set_level).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should handle set_level correctly", () => {
      const originalLevel = logger.level;
      logger.set_level(DEBUG);
      expect(logger.level).toBe(DEBUG);
      logger.set_level(originalLevel);
    });

    it("should handle all log methods without errors", () => {
      expect(() => {
        logger.debug("Debug test");
        logger.info("Info test");
        logger.warn("Warn test");
        logger.error("Error test");
      }).not.toThrow();
    });
  });
});

describe("Edge Cases and Error Handling", () => {
  let logger: TestLogger;

  beforeEach(() => {
    logger = new TestLogger("EdgeTest", DEBUG);
  });

  it("should handle empty messages", () => {
    logger.info("");
    expect(logger.infoMessages[0]).toContain("INFO:");
  });

  it("should handle very long messages", () => {
    const longMessage = "a".repeat(10000);
    logger.info(longMessage);
    expect(logger.infoMessages[0]).toContain(longMessage);
  });

  it("should handle special characters in messages", () => {
    const specialMessage = "特殊字符 🎉 emoji \n newline \t tab";
    logger.info(specialMessage);
    expect(logger.infoMessages[0]).toContain(specialMessage);
  });

  it("should handle large number of arguments", () => {
    const args = Array.from({ length: 100 }, (_, i) => ({ index: i }));
    logger.info("Many args", ...args);
    expect(logger.infoMessages[0]).toContain("Many args");
  });

  it("should handle complex nested objects", () => {
    const complexObj = {
      level1: {
        level2: {
          level3: {
            data: "deep",
            array: [1, 2, { nested: true }],
            date: new Date("2023-01-01"),
          },
        },
      },
    };

    logger.info("Complex object", complexObj);
    expect(logger.infoMessages[0]).toContain("Complex object");
  });

  it("should handle functions in arguments", () => {
    const func = () => "test";
    logger.info("Function arg", func);
    expect(logger.infoMessages[0]).toContain("Function arg");
  });

  it("should handle Symbol arguments", () => {
    const symbol = Symbol("test");
    logger.info("Symbol arg", symbol);
    expect(logger.infoMessages[0]).toContain("Symbol arg");
  });
});

describe("String to Level Conversion", () => {
  it("should convert valid string levels case-insensitively", () => {
    const testCases = [
      { input: "debug", expected: DEBUG },
      { input: "DEBUG", expected: DEBUG },
      { input: "Debug", expected: DEBUG },
      { input: "info", expected: INFO },
      { input: "INFO", expected: INFO },
      { input: "warn", expected: WARN },
      { input: "WARN", expected: WARN },
      { input: "warning", expected: WARN },
      { input: "WARNING", expected: WARN },
      { input: "error", expected: ERROR },
      { input: "ERROR", expected: ERROR },
    ];

    testCases.forEach(({ input, expected }) => {
      const logger = new TestLogger("Test", input);
      expect(logger.level).toBe(expected);
    });
  });

  it("should handle numeric levels directly", () => {
    const logger = new TestLogger("Test", 25);
    expect(logger.level).toBe(25);
  });

  it("should throw error for invalid string levels", () => {
    const invalidLevels = ["invalid", "trace", "fatal", "", " ", "123"];

    invalidLevels.forEach((level) => {
      expect(() => {
        new TestLogger("Test", level);
      }).toThrow(`Unknown log level: ${level}`);
    });
  });
});

describe("Level to String Conversion", () => {
  it("should convert known numeric levels to strings", () => {
    const logger = new TestLogger("Test", DEBUG);

    logger.set_level(DEBUG);
    expect(logger.level_name).toBe("DEBUG");

    logger.set_level(INFO);
    expect(logger.level_name).toBe("INFO");

    logger.set_level(WARN);
    expect(logger.level_name).toBe("WARN");

    logger.set_level(ERROR);
    expect(logger.level_name).toBe("ERROR");
  });

  it('should return "UNKNOWN" for unknown numeric levels', () => {
    const logger = new TestLogger("Test", 999);
    expect(logger.level_name).toBe("UNKNOWN");
  });
});

describe("Performance Considerations", () => {
  let logger: TestLogger;

  beforeEach(() => {
    logger = new TestLogger("PerfTest", ERROR); // High level to test filtering
  });

  it("should not format messages when level filtering prevents output", () => {
    const heavyObject = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `item-${i}`,
      })),
    };

    // Mock the format_message method to track calls
    const formatSpy = vi.spyOn(logger, "format_message");

    // These should be filtered out and not call format_message
    logger.debug("Heavy debug", heavyObject);
    logger.info("Heavy info", heavyObject);
    logger.warn("Heavy warn", heavyObject);

    expect(formatSpy).not.toHaveBeenCalled();

    // This should call format_message
    logger.error("Heavy error", new Error("Heavy error"));
    expect(formatSpy).toHaveBeenCalledOnce();
  });
});

describe("Real-world Usage Scenarios", () => {
  it("should work in typical application logging scenario", () => {
    const appLogger = new ConsoleLogger("MyApp", INFO);
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    // Simulate application events
    appLogger.info("Application started", {
      version: "1.0.0",
      env: "production",
    });
    appLogger.info("User logged in", { userId: 123, timestamp: Date.now() });
    appLogger.info("Data processed", { recordCount: 500, duration: "2.3s" });

    expect(consoleSpy).toHaveBeenCalledTimes(3);
    vi.restoreAllMocks();
  });

  it("should work for error tracking and debugging", () => {
    const debugLogger = new ConsoleLogger("Debugger", DEBUG);
    const consoleSpies = {
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    try {
      // Simulate some operation
      throw new Error("Something went wrong");
    } catch (error) {
      debugLogger.debug("Operation attempted", { operation: "dataProcessing" });
      debugLogger.error("Operation failed", error as Error);
    }

    expect(consoleSpies.debug).toHaveBeenCalledOnce();
    // console.error is called twice: once for the formatted message, once for the Error object
    expect(consoleSpies.error).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it("should work for UI component logging with DivLogger", () => {
    const logContainer = document.createElement("div");
    const uiLogger = new DivLogger(logContainer, "UI", DEBUG);

    // Simulate UI events
    uiLogger.debug("Component rendering", { component: "UserProfile" });
    uiLogger.info("User interaction", {
      action: "button-click",
      target: "save",
    });
    uiLogger.warn("Validation warning", {
      field: "email",
      issue: "invalid-format",
    });

    const logEntries = logContainer.querySelectorAll("div");
    expect(logEntries).toHaveLength(3);
    expect(logEntries[0].className).toBe("debug");
    expect(logEntries[1].className).toBe("info");
    expect(logEntries[2].className).toBe("warn");
  });
});
