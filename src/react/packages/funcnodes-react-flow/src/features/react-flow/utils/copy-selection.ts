const isTextSelectionElement = (
  element: Element | null
): element is HTMLInputElement | HTMLTextAreaElement => {
  if (!element) {
    return false;
  }

  return (
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
  );
};

const isNoKeyElement = (element: EventTarget | Element | null): boolean => {
  if (!(element instanceof Element)) {
    return false;
  }

  return Boolean(element.closest(".nokey"));
};

export const shouldPreserveNativeCopy = (
  target: EventTarget | null = null,
  doc: Document = document
): boolean => {
  if (isNoKeyElement(target) || isNoKeyElement(doc.activeElement)) {
    return true;
  }

  const activeElement = doc.activeElement;
  if (isTextSelectionElement(activeElement)) {
    const { selectionStart, selectionEnd } = activeElement;
    if (
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionStart !== selectionEnd
    ) {
      return true;
    }
  }

  const selection = doc.getSelection?.() ?? window.getSelection?.();
  return Boolean(selection && !selection.isCollapsed);
};
