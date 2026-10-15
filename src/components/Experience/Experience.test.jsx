import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Experience } from "./Experience";
import history from "../../data/history.json";

describe("Experience", () => {
  it("renders one entry per history item with role, organization, dates, and logo, in order", () => {
    render(<Experience />);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(history.map((item) => `${item.role}, ${item.organization}`));

    const logos = screen.getAllByRole("img").map((img) => img.getAttribute("src"));
    expect(logos).toHaveLength(history.length);
    history.forEach((item, i) => {
      expect(logos[i]).toMatch(new RegExp(`/assets/${item.imageSrc}$`));
      expect(screen.getAllByText(`${item.startDate}-${item.endDate}`, { exact: false }).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders every bullet point", () => {
    render(<Experience />);
    for (const item of history) {
      for (const line of item.experiences) {
        expect(screen.getByText(line)).toBeInTheDocument();
      }
    }
  });

  it("links each entry to the organization in a new tab", () => {
    render(<Experience />);
    const links = screen.getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(history.map((h) => h.link));
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("has the section id the navbar scrolls to", () => {
    const { container } = render(<Experience />);
    expect(container.querySelector("section#experience")).toBeInTheDocument();
  });
});
