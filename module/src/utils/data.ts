function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64); // Decode base64 to binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(data: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < data.byteLength; i++) {
    binaryString += String.fromCharCode(data[i]);
  }
  return window.btoa(binaryString);
}

function Uint8ArrayToBlob(data: Uint8Array, type: string): Blob {
  return new Blob([data], { type });
}

function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };
    reader.readAsArrayBuffer(blob);
  });
}

function base64ToBlob(base64: string, type: string): Blob {
  return Uint8ArrayToBlob(base64ToUint8Array(base64), type);
}

function blobToBase64(blob: Blob): Promise<string> {
  return blobToUint8Array(blob).then((uint8Array) =>
    uint8ArrayToBase64(uint8Array)
  );
}

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

function FileToBase64(file: File, remove_prefix = true): Promise<string> {
  // if file is not provided open file dialog

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (remove_prefix) {
        resolve(base64.split(",")[1]);
      }
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

function fileDialogToFile(accept?: string): Promise<File> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        resolve(file);
      }
    };
    input.click();
  });
}

function fileDialogToBase64(accept?: string): Promise<string> {
  return fileDialogToFile(accept).then(FileToBase64);
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
};
