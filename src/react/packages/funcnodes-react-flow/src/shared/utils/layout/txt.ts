export interface ResizeTextOptions {
  maxFontSize?: number; // The starting (maximum) font size to try.
  minFontSize?: number; // The minimum font size allowed.
  decrementFactor?: number; // How much to decrease font size each iteration.
}

/**
 * Dynamically adjusts the font size of a text element so that it fits within its container.
 *
 * @param container - The container element that defines the maximum space.
 * @param textElement - The element whose text needs to be resized.
 * @param options - Optional configuration (maxFontSize, minFontSize, decrementFactor).
 */
export function fitTextToContainer(
  container: HTMLElement,
  textElement: HTMLElement,
  options: ResizeTextOptions = {}
): void {
  const {
    maxFontSize = 100, // default maximum font size
    minFontSize = 6, // default minimum font size
    decrementFactor = 0.9, // font size decrement step
  } = options;

  if (!container || !textElement) {
    return;
  }

  if (decrementFactor >= 1 || decrementFactor <= 0) {
    throw new Error("decrementFactor must be between 0 and 1");
  }
  // Get container dimensions
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Start with the maximum font size
  let fontSize = maxFontSize;

  // Apply the font size, measure, and adjust
  textElement.style.whiteSpace = "nowrap"; // ensure single line measurement if desired
  textElement.style.display = "inline-block";

  // Set initial font size
  textElement.style.fontSize = fontSize + "px";
  let textRect = textElement.getBoundingClientRect();

  // While text doesn't fit and we haven't reached the minimum font size
  // Check both width and height to ensure the text fits completely.
  while (
    (textRect.width > containerWidth || textRect.height > containerHeight) &&
    fontSize > minFontSize
  ) {
    fontSize *= decrementFactor;
    textElement.style.fontSize = fontSize + "px";
    textRect = textElement.getBoundingClientRect();
  }

  // If you want the text to break lines and fill multi-line container, remove whiteSpace override:
  // textElement.style.whiteSpace = "normal";
}

/*
Example usage (in a component or script):
-----------------------------------------
const container = document.getElementById('text-container');
const textElement = document.getElementById('text-content');

if (container && textElement) {
  fitTextToContainer(container, textElement, {
    maxFontSize: 72,
    minFontSize: 10,
    decrementFactor: 0.9
  });
}
*/
