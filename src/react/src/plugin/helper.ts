function assertNever(x: never): void {
  console.error("Unhandled case: " + x);
}
export { assertNever };
