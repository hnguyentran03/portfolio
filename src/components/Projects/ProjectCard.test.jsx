import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { ProjectCard } from "./ProjectCard";
import { LocationProbe } from "../../test/LocationProbe";
import { fixtureProjects } from "../../test/fixtures";

const project = fixtureProjects[0];

const renderCard = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<ProjectCard project={project} />} />
        <Route path="/projects/:slug" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe("ProjectCard", () => {
  it("renders the project's metadata", () => {
    renderCard();
    expect(screen.getByRole("heading", { level: 3, name: "Alpha Project" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Jan 2026" })).toBeInTheDocument();
    expect(screen.getByText("Alpha description")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Image of Alpha Project" })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/assets\/projects\/tetris\.png$/)
    );
    const skills = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(skills).toEqual(["Rust", "SDL2"]);
  });

  it("is keyboard focusable and exposed as a link", () => {
    renderCard();
    expect(screen.getByRole("link")).toHaveAttribute("tabindex", "0");
  });

  it("navigates to the project page on click", () => {
    renderCard();
    fireEvent.click(screen.getByRole("link"));
    expect(screen.getByTestId("location")).toHaveTextContent("/projects/alpha");
  });

  it("navigates on Enter but not on other keys", () => {
    renderCard();
    fireEvent.keyDown(screen.getByRole("link"), { key: " " });
    expect(screen.queryByTestId("location")).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("link"), { key: "Enter" });
    expect(screen.getByTestId("location")).toHaveTextContent("/projects/alpha");
  });
});
