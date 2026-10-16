import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen } from "@testing-library/react";

import App from "./App";
import { renderWithRouter } from "./test/renderWithRouter";

vi.mock("./data/projects.json", async () => {
  const { fixtureProjects } = await import("./test/fixtures");
  return { default: fixtureProjects };
});

describe("App routes", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Hero's interval must not leak between tests
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("/ renders the home page sections", () => {
    const { container } = renderWithRouter(<App />, { route: "/" });
    expect(screen.getByRole("heading", { level: 1, name: "Hello, I'm Ben Nguyen" })).toBeInTheDocument();
    for (const id of ["about", "experience", "projects", "contact"]) {
      expect(container.querySelector(`section#${id}`)).toBeInTheDocument();
    }
  });

  it("/projects renders the all projects page", () => {
    renderWithRouter(<App />, { route: "/projects" });
    expect(screen.getByRole("heading", { level: 2, name: "All Projects" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("/projects/:slug renders the project page", () => {
    renderWithRouter(<App />, { route: "/projects/beta" });
    expect(screen.getByRole("heading", { level: 2, name: "Beta Project" })).toBeInTheDocument();
  });

  it("/projects/:slug with a trailing slash still matches", () => {
    renderWithRouter(<App />, { route: "/projects/beta/" });
    expect(screen.getByRole("heading", { level: 2, name: "Beta Project" })).toBeInTheDocument();
  });

  it("unknown routes render the 404 page", () => {
    renderWithRouter(<App />, { route: "/nope/really" });
    expect(screen.getByRole("heading", { level: 2, name: "Page Not Found" })).toBeInTheDocument();
  });
});
