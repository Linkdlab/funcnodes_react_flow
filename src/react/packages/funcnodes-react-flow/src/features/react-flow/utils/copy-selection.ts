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

export const hasNativeCopySelection = (doc: Document = document): boolean => {
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
