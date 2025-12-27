import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const MONOREPO_PACKAGE_NAME = "funcnodes-react-flow-monorepo";

const findMonorepoPackageJson = () => {
  let current = process.cwd();

  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, "utf8"));
      if (parsed?.name === MONOREPO_PACKAGE_NAME) {
        return { path: candidate, data: parsed };
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  throw new Error(
    `Unable to locate ${MONOREPO_PACKAGE_NAME} package.json from ${process.cwd()}`
  );
};

describe("workspace root package.json", () => {
  it("runs tests with coverage enabled by default", () => {
    const { data } = findMonorepoPackageJson();
    const testScript = data?.scripts?.test;

    expect(testScript).toBeTypeOf("string");
    expect(testScript).toContain("--coverage");
    expect(testScript).toContain(
      "workspace @linkdlab/funcnodes_react_flow"
    );
  });
});
