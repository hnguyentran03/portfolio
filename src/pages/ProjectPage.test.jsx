import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";

import { ProjectPage } from "./ProjectPage";
import { renderWithRouter } from "../test/renderWithRouter";

vi.mock("../data/projects.json", async () => {
  const { fixtureProjects } = await import("../test/fixtures");
  return { default: fixtureProjects };
});

const renderAt = (route) =>
  renderWithRouter(
    <Routes>
      <Route path="/projects/:slug" element={<ProjectPage />} />
    </Routes>,
    { route }
  );

describe("ProjectPage", () => {
  it("renders the project header, skills, and image", () => {
    renderAt("/projects/alpha");
    expect(screen.getByRole("heading", { level: 2, name: "Alpha Project" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Jan 2026" })).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("SDL2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Image of Alpha Project" })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/assets\/projects\/tetris\.png$/)
    );
  });

  it("shows the fallback description when there is no content file", () => {
    renderAt("/projects/alpha");
    expect(screen.getByText("Alpha description")).toBeInTheDocument();
  });

  it("renders Source and Demo links that open in a new tab", () => {
    renderAt("/projects/alpha");
    const source = screen.getByRole("link", { name: "Source" });
    const demo = screen.getByRole("link", { name: "Demo" });
    expect(source).toHaveAttribute("href", "https://github.com/example/alpha");
    expect(demo).toHaveAttribute("href", "https://example.com/alpha-demo");
    for (const link of [source, demo]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("hides links whose URL is an empty string", () => {
    renderAt("/projects/beta");
    expect(screen.queryByRole("link", { name: "Source" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Demo" })).not.toBeInTheDocument();
  });

  it("links back to the projects list and scrolls to top", () => {
    renderAt("/projects/alpha");
    expect(screen.getByRole("link", { name: /back to projects/i })).toHaveAttribute("href", "/projects");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("renders the 404 page for an unknown slug", () => {
    renderAt("/projects/does-not-exist");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeInTheDocument();
  });
});
