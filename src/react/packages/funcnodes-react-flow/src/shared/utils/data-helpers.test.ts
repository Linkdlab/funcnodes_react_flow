import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
  Uint8ArrayToBlob,
  blobToUint8Array,
  base64ToBlob,
  blobToBase64,
  downloadBase64,
  FileToBase64,
  fileDialogToFile,
  fileDialogToBase64,
  remoteUrlToBase64,
} from "./data-helpers";

// Test data
const testString = "Hello World";
const testBase64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
const testUint8Array = new Uint8Array([
  72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
]);

describe("data-helper", () => {
  let originalFileReader: typeof FileReader | undefined;

  beforeEach(() => {
    originalFileReader = global.FileReader;

    // Mock window.atob and window.btoa
    global.window.atob = vi.fn().mockImplementation((str: string) => {
      // Simple mock implementation for base64 decoding
      if (str === testBase64) {
        return testString;
      }
      return "decoded";
    });
    global.window.btoa = vi.fn().mockImplementation((str: string) => {
      // Simple mock implementation for base64 encoding
      if (str === testString) {
        return testBase64;
      }
      return "encoded";
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock fetch for remoteUrlToBase64 tests
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.FileReader = originalFileReader as any;
  });

  describe("base64ToUint8Array", () => {
    it("should convert base64 string to Uint8Array", () => {
      const result = base64ToUint8Array(testBase64);

      expect(window.atob).toHaveBeenCalledWith(testBase64);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(testString.length);
    });

    it("should handle empty base64 string", () => {
      window.atob = vi.fn().mockReturnValue("");
      const result = base64ToUint8Array("");

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });
  });

  describe("uint8ArrayToBase64", () => {
    it("should convert Uint8Array to base64 string", () => {
      const result = uint8ArrayToBase64(testUint8Array);

      expect(window.btoa).toHaveBeenCalled();
      expect(typeof result).toBe("string");
    });

    it("should handle empty Uint8Array", () => {
      const result = uint8ArrayToBase64(new Uint8Array());

      expect(window.btoa).toHaveBeenCalledWith("");
      expect(typeof result).toBe("string");
    });
  });

  describe("Uint8ArrayToBlob", () => {
    it("should convert Uint8Array to Blob with specified type", () => {
      const type = "text/plain";
      const result = Uint8ArrayToBlob(testUint8Array, type);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(type);
    });

    it("should handle different MIME types", () => {
      const types = ["image/png", "application/pdf", "text/html"];

      types.forEach((type) => {
        const result = Uint8ArrayToBlob(testUint8Array, type);
        expect(result.type).toBe(type);
      });
    });
  });

  describe("blobToUint8Array", () => {
    it("should convert Blob to Uint8Array", async () => {
      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: new ArrayBuffer(5),
        readAsArrayBuffer: vi
          .fn()
          .mockImplementation(function (this: FileReader) {
            // Simulate successful read
            setTimeout(() => {
              if (this.onload) {
                this.onload.call(this, {} as ProgressEvent<FileReader>);
              }
            }, 0);
          }),
      };

      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const blob = new Blob(["test"], { type: "text/plain" });
      const result = await blobToUint8Array(blob);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(blob);
    });
  });

  describe("base64ToBlob", () => {
    it("should convert base64 to Blob with specified type", () => {
      const type = "image/png";
      const result = base64ToBlob(testBase64, type);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe(type);
    });
  });

  describe("blobToBase64", () => {
    it("should convert Blob to base64 string", async () => {
      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: new ArrayBuffer(5),
        readAsArrayBuffer: vi
          .fn()
          .mockImplementation(function (this: FileReader) {
            setTimeout(() => {
              if (this.onload) {
                this.onload.call(this, {} as ProgressEvent<FileReader>);
              }
            }, 0);
          }),
      };

      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const blob = new Blob(["test"], { type: "text/plain" });
      const result = await blobToBase64(blob);

      expect(typeof result).toBe("string");
    });
  });

  describe("downloadBase64", () => {
    it("should trigger download with correct parameters", () => {
      const mockAnchor = {
        href: "",
        download: "",
        click: vi.fn(),
        remove: vi.fn(),
      };

      global.document.createElement = vi.fn().mockReturnValue(mockAnchor);

      const filename = "test.txt";
      const type = "text/plain";

      downloadBase64(testBase64, filename, type);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockAnchor.href).toBe("blob:mock-url");
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.remove).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("FileToBase64", () => {
    it("should convert File to base64 with prefix removed", async () => {
      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: `data:text/plain;base64,${testBase64}`,
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const file = new File(["test"], "test.txt", { type: "text/plain" });
      const result = await FileToBase64(file);

      expect(result).toBe(testBase64);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });

    it("should convert File to base64 with prefix included", async () => {
      const dataUrl = `data:text/plain;base64,${testBase64}`;
      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: dataUrl,
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const file = new File(["test"], "test.txt", { type: "text/plain" });
      const result = await FileToBase64(file, false);

      expect(result).toBe(dataUrl);
    });
  });

  describe("fileDialogToFile", () => {
    it("should create file input and return selected file", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const mockInput = {
        type: "",
        accept: "",
        files: [mockFile],
        onchange: null as (() => void) | null,
        click: vi.fn().mockImplementation(function (this: HTMLInputElement) {
          setTimeout(() => {
            if (this.onchange) {
              this.onchange({} as Event);
            }
          }, 0);
        }),
      };

      global.document.createElement = vi.fn().mockReturnValue(mockInput);

      const resultPromise = fileDialogToFile("image/*");
      const result = await resultPromise;

      expect(document.createElement).toHaveBeenCalledWith("input");
      expect(mockInput.type).toBe("file");
      expect(mockInput.accept).toBe("image/*");
      expect(mockInput.click).toHaveBeenCalled();
      expect(result).toBe(mockFile);
    });

    it("should work without accept parameter", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const mockInput = {
        type: "",
        accept: "",
        files: [mockFile],
        onchange: null as (() => void) | null,
        click: vi.fn().mockImplementation(function (this: HTMLInputElement) {
          setTimeout(() => {
            if (this.onchange) {
              this.onchange({} as Event);
            }
          }, 0);
        }),
      };

      global.document.createElement = vi.fn().mockReturnValue(mockInput);

      await fileDialogToFile();

      expect(mockInput.accept).toBe("");
    });
  });

  describe("fileDialogToBase64", () => {
    it("should combine fileDialogToFile and FileToBase64", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const mockInput = {
        type: "",
        accept: "",
        files: [mockFile],
        onchange: null as (() => void) | null,
        click: vi.fn().mockImplementation(function (this: HTMLInputElement) {
          setTimeout(() => {
            if (this.onchange) {
              this.onchange({} as Event);
            }
          }, 0);
        }),
      };

      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: `data:text/plain;base64,${testBase64}`,
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.document.createElement = vi.fn().mockReturnValue(mockInput);
      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const result = await fileDialogToBase64("image/*");

      expect(result).toBe(testBase64);
    });
  });

  describe("remoteUrlToBase64", () => {
    it("should fetch URL and convert to base64", async () => {
      const mockBlob = new Blob(["test"], { type: "text/plain" });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        onerror: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: `data:text/plain;base64,${testBase64}`,
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const url = "https://example.com/test.txt";
      const result = await remoteUrlToBase64(url);

      expect(fetch).toHaveBeenCalledWith(url);
      expect(mockResponse.blob).toHaveBeenCalled();
      expect(result).toBe(testBase64);
    });

    it("should include prefix when remove_prefix is false", async () => {
      const mockBlob = new Blob(["test"], { type: "text/plain" });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      const dataUrl = `data:text/plain;base64,${testBase64}`;
      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        onerror: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        result: dataUrl,
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      const result = await remoteUrlToBase64(
        "https://example.com/test.txt",
        false
      );

      expect(result).toBe(dataUrl);
    });

    it("should throw error for failed fetch", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        remoteUrlToBase64("https://example.com/nonexistent.txt")
      ).rejects.toThrow("Failed to fetch from URL: 404 Not Found");

      consoleSpy.mockRestore();
    });

    it("should throw error for network failure", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        remoteUrlToBase64("https://example.com/test.txt")
      ).rejects.toThrow("Network error");

      consoleSpy.mockRestore();
    });

    it("should handle FileReader errors", async () => {
      const mockBlob = new Blob(["test"], { type: "text/plain" });
      const mockResponse = {
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      const mockFileReader = {
        onload: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        onerror: null as
          | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
          | null,
        error: new Error("FileReader error"),
        readAsDataURL: vi.fn().mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror.call(this, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);
      global.FileReader = (function MockFileReader() {
        return mockFileReader as any;
      } as unknown) as any;

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        remoteUrlToBase64("https://example.com/test.txt")
      ).rejects.toThrow("FileReader error");

      consoleSpy.mockRestore();
    });
  });
});
