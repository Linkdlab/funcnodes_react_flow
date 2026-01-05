/**
 * Converts a base64 encoded string to a Uint8Array.
 *
 * @param base64 - The base64 encoded string to convert
 * @returns A Uint8Array containing the decoded binary data
 *
 * @example
 * ```typescript
 * const base64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
 * const uint8Array = base64ToUint8Array(base64);
 * ```
 */
function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const binaryString = window.atob(base64); // Decode base64 to binary string
  const len = binaryString.length;
  const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts a Uint8Array to a base64 encoded string.
 *
 * @param data - The Uint8Array to convert
 * @returns A base64 encoded string representation of the data
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
 * const base64 = uint8ArrayToBase64(data);
 * console.log(base64); // "SGVsbG8="
 * ```
 */
function uint8ArrayToBase64(data: Uint8Array<ArrayBuffer>): string {
  let binaryString = "";
  for (let i = 0; i < data.byteLength; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  return window.btoa(binaryString);
}

/**
 * Converts a Uint8Array to a Blob object with the specified MIME type.
 *
 * @param data - The Uint8Array containing the binary data
 * @param type - The MIME type for the resulting Blob (e.g., "image/png", "text/plain")
 * @returns A Blob object containing the data
 *
 * @example
 * ```typescript
 * const data = new Uint8Array([137, 80, 78, 71]); // PNG header
 * const blob = Uint8ArrayToBlob(data, "image/png");
 * ```
 */
function Uint8ArrayToBlob(data: Uint8Array<ArrayBuffer>, type: string): Blob {
  return new Blob([data], { type });
}

/**
 * Converts a Blob object to a Uint8Array.
 *
 * @param blob - The Blob to convert
 * @returns A Promise that resolves to a Uint8Array containing the blob's data
 *
 * @example
 * ```typescript
 * const blob = new Blob(["Hello World"], { type: "text/plain" });
 * const uint8Array = await blobToUint8Array(blob);
 * ```
 */
function blobToUint8Array(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Converts a base64 encoded string to a Blob object with the specified MIME type.
 *
 * @param base64 - The base64 encoded string to convert
 * @param type - The MIME type for the resulting Blob (e.g., "image/png", "application/pdf")
 * @returns A Blob object containing the decoded data
 *
 * @example
 * ```typescript
 * const base64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
 * const blob = base64ToBlob(base64, "text/plain");
 * ```
 */
function base64ToBlob(base64: string, type: string): Blob {
  return Uint8ArrayToBlob(base64ToUint8Array(base64), type);
}

/**
 * Converts a Blob object to a base64 encoded string.
 *
 * @param blob - The Blob to convert
 * @returns A Promise that resolves to a base64 encoded string
 *
 * @example
 * ```typescript
 * const blob = new Blob(["Hello World"], { type: "text/plain" });
 * const base64 = await blobToBase64(blob);
 * console.log(base64); // "SGVsbG8gV29ybGQ="
 * ```
 */
function blobToBase64(blob: Blob): Promise<string> {
  return blobToUint8Array(blob).then((uint8Array) =>
    uint8ArrayToBase64(uint8Array)
  );
}

/**
 * Downloads a base64 encoded string as a file to the user's device.
 * Creates a temporary download link and triggers the download automatically.
 *
 * @param base64 - The base64 encoded data to download
 * @param filename - The desired filename for the downloaded file
 * @param type - The MIME type of the file (e.g., "image/png", "application/pdf")
 *
 * @example
 * ```typescript
 * const base64Data = "SGVsbG8gV29ybGQ="; // "Hello World" in base64
 * downloadBase64(base64Data, "hello.txt", "text/plain");
 * ```
 */
function downloadBase64(base64: string, filename: string, type: string) {
  const blob = base64ToBlob(base64, type);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

/**
 * Converts a File object to a base64 encoded string.
 *
 * @param file - The File object to convert
 * @param remove_prefix - Whether to remove the data URL prefix (e.g., "data:image/png;base64,"). Defaults to true
 * @returns A Promise that resolves to a base64 encoded string
 *
 * @example
 * ```typescript
 * const file = new File(["Hello World"], "hello.txt", { type: "text/plain" });
 * const base64 = await FileToBase64(file);
 * console.log(base64); // "SGVsbG8gV29ybGQ="
 *
 * // With prefix included:
 * const base64WithPrefix = await FileToBase64(file, false);
 * console.log(base64WithPrefix); // "data:text/plain;base64,SGVsbG8gV29ybGQ="
 * ```
 */
function FileToBase64(file: File, remove_prefix = true): Promise<string> {
  // if file is not provided open file dialog

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (remove_prefix) {
        resolve(base64.split(",")[1]);
      } else {
        resolve(base64);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Opens a file selection dialog and returns the selected File object.
 *
 * @param accept - Optional file type filter (e.g., "image/*", ".pdf", "image/png,image/jpeg")
 * @returns A Promise that resolves to the selected File object
 *
 * @example
 * ```typescript
 * // Allow any file type
 * const file = await fileDialogToFile();
 *
 * // Only allow image files
 * const imageFile = await fileDialogToFile("image/*");
 *
 * // Only allow PDF files
 * const pdfFile = await fileDialogToFile(".pdf");
 * ```
 */
function fileDialogToFile(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error("No file selected"));
      }
    };
    // Handle dialog cancellation
    input.oncancel = () => {
      reject(new Error("File selection cancelled"));
    };
    input.click();
  });
}

/**
 * Opens a file selection dialog and returns the selected file as a base64 encoded string.
 * This is a convenience function that combines fileDialogToFile() and FileToBase64().
 *
 * @param accept - Optional file type filter (e.g., "image/*", ".pdf", "image/png,image/jpeg")
 * @returns A Promise that resolves to a base64 encoded string (without data URL prefix)
 *
 * @example
 * ```typescript
 * // Allow any file type
 * const base64 = await fileDialogToBase64();
 *
 * // Only allow image files
 * const imageBase64 = await fileDialogToBase64("image/*");
 * ```
 */
function fileDialogToBase64(accept?: string): Promise<string> {
  return fileDialogToFile(accept).then(FileToBase64);
}

/**
 * Fetches content from a remote URL and converts it to a base64 encoded string.
 *
 * @param url - The URL to fetch content from
 * @param remove_prefix - Whether to remove the data URL prefix (e.g., "data:image/png;base64,"). Defaults to true
 * @returns A Promise that resolves to a base64 encoded string
 * @throws {Error} If the fetch operation fails or the URL is not accessible
 *
 * @example
 * ```typescript
 * try {
 *   const base64 = await remoteUrlToBase64("https://example.com/image.png");
 *   console.log("Image converted to base64:", base64);
 * } catch (error) {
 *   console.error("Failed to convert URL to base64:", error);
 * }
 *
 * // With data URL prefix included:
 * const base64WithPrefix = await remoteUrlToBase64("https://example.com/image.png", false);
 * ```
 */
async function remoteUrlToBase64(
  url: string,
  remove_prefix = true
): Promise<string> {
  try {
    // Fetch the content from the URL
    const response = await fetch(url);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(
        `Failed to fetch from URL: ${response.status} ${response.statusText}`
      );
    }

    // Get the response as a Blob
    const blob = await response.blob();

    // Convert Blob to Base64 using FileReader
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject("Failed to convert URL to Base64: No result from FileReader");
          reject(reader.error);
        }
        if (remove_prefix) {
          resolve((result as string).split(",")[1]); // Remove the data prefix if specified
        } else {
          resolve(result as string);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

    return base64;
  } catch (error) {
    console.error("Error converting URL to Base64:", error);
    throw error;
  }
}

export {
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
};
