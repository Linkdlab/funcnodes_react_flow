import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  MenuRoundedIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  CloseFullscreenIcon,
  OpenInFullIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExpandLessIcon,
  CloseIcon,
  LockOpenIcon,
  LockIcon,
  LanIcon,
  PlayCircleFilledIcon,
  SearchIcon,
  GearIcon,
  CheckmarkIcon,
  ErrorIcon,
} from "./fontawsome";

const iconComponents = [
  MenuRoundedIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  CloseFullscreenIcon,
  OpenInFullIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExpandLessIcon,
  CloseIcon,
  LockOpenIcon,
  LockIcon,
  LanIcon,
  PlayCircleFilledIcon,
  SearchIcon,
  GearIcon,
  CheckmarkIcon,
  ErrorIcon,
];

describe("fontawesome icon wrappers", () => {
  it("renders all icon components", () => {
    render(
      <div>
        {iconComponents.map((Icon, index) => (
          <Icon data-testid={`icon-${index}`} key={String(index)} />
        ))}
      </div>
    );

    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(iconComponents.length);
  });

  it("applies wrapper style props", () => {
    render(
      <MenuRoundedIcon data-testid="menu-icon" style={{ color: "rgb(1, 2, 3)" }} />
    );

    const svg = screen.getByTestId("menu-icon");
    const wrapper = svg.parentElement;

    expect(wrapper).toHaveStyle({ color: "rgb(1, 2, 3)" });
  });
});
