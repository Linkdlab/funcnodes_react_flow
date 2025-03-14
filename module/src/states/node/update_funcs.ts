const simple_updater = <
  U extends string | number | boolean,
  T extends U | undefined
>(
  oldvalue: U,
  newvalue: T
): [U, boolean] => {
  return newvalue === undefined
    ? [oldvalue, false]
    : [newvalue, oldvalue !== newvalue];
};

function assertNever(x: never, y: any): never {
  throw new Error("Unhandled case: " + x + " with: " + JSON.stringify(y));
}

export { simple_updater, assertNever };
