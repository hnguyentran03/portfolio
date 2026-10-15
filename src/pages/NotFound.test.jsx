import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { NotFound } from "./NotFound";
import { renderWithRouter } from "../test/renderWithRouter";

describe("NotFound", () => {
  it("shows the 404 copy and a link home", () => {
    renderWithRouter(<NotFound />, { route: "/nope" });
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it("scrolls to the top on mount", () => {
    renderWithRouter(<NotFound />, { route: "/nope" });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
