import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { ErrorDiv } from "./index";

describe("ErrorDiv", () => {
  describe("basic rendering", () => {
    it("should render error heading", () => {
      const testError = new Error("Test error message");

      render(<ErrorDiv error={testError} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Error");
    });

    it("should render error message", () => {
      const testError = new Error("This is a test error");

      render(<ErrorDiv error={testError} />);

      const message = screen.getByText("This is a test error");
      expect(message).toBeInTheDocument();
      expect(message.tagName).toBe("P");
    });

    it("should render with correct CSS class", () => {
      const testError = new Error("Test error");

      const { container } = render(<ErrorDiv error={testError} />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass("error-div");
    });
  });

  describe("error message handling", () => {
    it("should handle empty error message", () => {
      const testError = new Error("");

      render(<ErrorDiv error={testError} />);

      const message = screen.getByRole("paragraph");
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent("");
    });

    it("should handle long error messages", () => {
      const longMessage = "This is a very long error message ".repeat(10);
      const testError = new Error(longMessage);

      render(<ErrorDiv error={testError} />);

      // Use a more flexible text matcher for long messages
      const message = screen.getByText(longMessage.trim());
      expect(message).toBeInTheDocument();
    });

    it("should handle special characters in error message", () => {
      const specialMessage =
        'Error: <script>alert("test")</script> & symbols ñáéíóú';
      const testError = new Error(specialMessage);

      render(<ErrorDiv error={testError} />);

      const message = screen.getByText(specialMessage);
      expect(message).toBeInTheDocument();
    });

    it("should handle multiline error messages", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const testError = new Error(multilineMessage);

      render(<ErrorDiv error={testError} />);

      // Use a more flexible matcher that handles whitespace normalization
      const message = screen.getByText((_, element) => {
        return element?.textContent === multilineMessage;
      });
      expect(message).toBeInTheDocument();
    });
  });

  describe("different error types", () => {
    it("should handle TypeError", () => {
      const typeError = new TypeError("Cannot read property of undefined");

      render(<ErrorDiv error={typeError} />);

      const message = screen.getByText("Cannot read property of undefined");
      expect(message).toBeInTheDocument();
    });

    it("should handle ReferenceError", () => {
      const refError = new ReferenceError("Variable is not defined");

      render(<ErrorDiv error={refError} />);

      const message = screen.getByText("Variable is not defined");
      expect(message).toBeInTheDocument();
    });

    it("should handle SyntaxError", () => {
      const syntaxError = new SyntaxError("Unexpected token");

      render(<ErrorDiv error={syntaxError} />);

      const message = screen.getByText("Unexpected token");
      expect(message).toBeInTheDocument();
    });

    it("should handle custom error classes", () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = "CustomError";
        }
      }

      const customError = new CustomError("Custom error occurred");

      render(<ErrorDiv error={customError} />);

      const message = screen.getByText("Custom error occurred");
      expect(message).toBeInTheDocument();
    });
  });

  describe("component structure", () => {
    it("should have correct DOM structure", () => {
      const testError = new Error("Structure test");

      const { container } = render(<ErrorDiv error={testError} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper).toHaveClass("error-div");

      const heading = wrapper.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("Error");

      const paragraph = wrapper.querySelector("p");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe("Structure test");
    });

    it("should render only heading and paragraph elements", () => {
      const testError = new Error("Simple structure");

      const { container } = render(<ErrorDiv error={testError} />);

      const wrapper = container.firstChild as HTMLElement;
      const children = Array.from(wrapper.children);

      expect(children).toHaveLength(2);
      expect(children[0].tagName).toBe("H1");
      expect(children[1].tagName).toBe("P");
    });
  });

  describe("accessibility", () => {
    it("should have accessible heading", () => {
      const testError = new Error("Accessibility test");

      render(<ErrorDiv error={testError} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAccessibleName("Error");
    });

    it("should have readable content structure", () => {
      const testError = new Error("Test for screen readers");

      render(<ErrorDiv error={testError} />);

      // Check that content is in logical reading order
      const heading = screen.getByRole("heading");
      const paragraph = screen.getByText("Test for screen readers");

      expect(heading.compareDocumentPosition(paragraph)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
  });

  describe("edge cases", () => {
    it("should handle undefined message gracefully", () => {
      // Create error with undefined message
      const errorWithUndefinedMessage = Object.create(Error.prototype);
      errorWithUndefinedMessage.message = undefined;

      render(<ErrorDiv error={errorWithUndefinedMessage} />);

      const heading = screen.getByText("Error");
      expect(heading).toBeInTheDocument();

      // Should still render paragraph element even with undefined message
      const paragraph = screen.getByRole("paragraph");
      expect(paragraph).toBeInTheDocument();
    });

    it("should handle null message gracefully", () => {
      // Create error with null message
      const errorWithNullMessage = Object.create(Error.prototype);
      errorWithNullMessage.message = null;

      render(<ErrorDiv error={errorWithNullMessage} />);

      const heading = screen.getByText("Error");
      expect(heading).toBeInTheDocument();

      const paragraph = screen.getByRole("paragraph");
      expect(paragraph).toBeInTheDocument();
    });

    it("should handle numeric error messages", () => {
      // Create error with numeric message
      const errorWithNumericMessage = Object.create(Error.prototype);
      errorWithNumericMessage.message = 404;

      render(<ErrorDiv error={errorWithNumericMessage} />);

      const message = screen.getByText("404");
      expect(message).toBeInTheDocument();
    });
  });

  describe("snapshot testing", () => {
    it("should match snapshot for standard error", () => {
      const testError = new Error("Standard error message");

      const { container } = render(<ErrorDiv error={testError} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it("should match snapshot for empty error", () => {
      const emptyError = new Error("");

      const { container } = render(<ErrorDiv error={emptyError} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
