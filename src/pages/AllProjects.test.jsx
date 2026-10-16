import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { AllProjects } from "./AllProjects";
import { renderWithRouter } from "../test/renderWithRouter";
import { fixtureProjects } from "../test/fixtures";

vi.mock("../data/projects.json", async () => {
  const { fixtureProjects } = await import("../test/fixtures");
  return { default: fixtureProjects };
});

describe("AllProjects page", () => {
  it("renders every project regardless of featured flag", () => {
    renderWithRouter(<AllProjects />, { route: "/projects" });
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(fixtureProjects.map((p) => p.title));
  });

  it("scrolls to the top on mount", () => {
    renderWithRouter(<AllProjects />, { route: "/projects" });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("links back home", () => {
    renderWithRouter(<AllProjects />, { route: "/projects" });
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});
