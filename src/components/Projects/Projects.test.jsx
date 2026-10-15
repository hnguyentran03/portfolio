import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { Projects } from "./Projects";
import { renderWithRouter } from "../../test/renderWithRouter";
import { fixtureProjects } from "../../test/fixtures";

vi.mock("../../data/projects.json", async () => {
  const { fixtureProjects } = await import("../../test/fixtures");
  return { default: fixtureProjects };
});

describe("Projects (home section)", () => {
  it("renders only featured projects", () => {
    renderWithRouter(<Projects />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(fixtureProjects.filter((p) => p.featured).map((p) => p.title));
  });

  it("has a section id for the navbar anchor and a link to all projects", () => {
    const { container } = renderWithRouter(<Projects />);
    expect(container.querySelector("section#projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all projects/i })).toHaveAttribute("href", "/projects");
  });
});
