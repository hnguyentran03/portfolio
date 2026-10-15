import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { About } from "./About";
import skills from "../../data/skills.json";

describe("About", () => {
  it("introduces Ben Nguyen", () => {
    render(<About />);
    expect(screen.getByRole("heading", { level: 2, name: "About" })).toBeInTheDocument();
    expect(screen.getByText("Ben Nguyen")).toBeInTheDocument();
  });

  it("renders one skill tile per skills.json entry", () => {
    render(<About />);
    for (const skill of skills) {
      expect(screen.getByText(skill.title)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: skill.title })).toHaveAttribute(
        "src",
        expect.stringMatching(new RegExp(`/assets/${skill.imageSrc}$`))
      );
    }
  });

  it("has the section id the navbar scrolls to", () => {
    const { container } = render(<About />);
    expect(container.querySelector("section#about")).toBeInTheDocument();
  });
});
