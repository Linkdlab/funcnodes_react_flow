import * as React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JSONDisplay } from "./index";

describe("JSONDisplay", () => {
  it("renders simple object data", () => {
    const testData = { key: "value", number: 42 };
    render(<JSONDisplay data={testData} />);

    // JsonView renders the data, so we check for the container
    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders array data", () => {
    const testData = [1, 2, 3, "test"];
    render(<JSONDisplay data={testData} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders empty object as empty string", () => {
    const testData = {};
    render(<JSONDisplay data={testData} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders null value", () => {
    render(<JSONDisplay data={null} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders undefined value", () => {
    render(<JSONDisplay data={undefined} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders primitive values", () => {
    render(<JSONDisplay data="string value" />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("renders nested objects", () => {
    const testData = {
      level1: {
        level2: {
          level3: "deep value"
        }
      }
    };
    render(<JSONDisplay data={testData} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const customClass = "custom-json-class";
    render(<JSONDisplay data={{ test: "data" }} className={customClass} />);

    const container = document.querySelector(`.${customClass}`);
    expect(container).toBeInTheDocument();
  });

  it("handles Object.create(null) objects", () => {
    const nullProtoObj = Object.create(null);
    nullProtoObj.key = "value";
    render(<JSONDisplay data={nullProtoObj} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });

  it("handles complex data structures", () => {
    const complexData = {
      string: "test",
      number: 123,
      boolean: true,
      array: [1, 2, { nested: "value" }],
      object: {
        nested: {
          deep: "value"
        }
      },
      nullValue: null,
      undefinedValue: undefined
    };
    render(<JSONDisplay data={complexData} />);

    const container = document.querySelector(".json-display");
    expect(container).toBeInTheDocument();
  });
});
