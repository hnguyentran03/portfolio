import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";

import { NavBar } from "./NavBar";
import { renderWithRouter } from "../../test/renderWithRouter";

describe("NavBar", () => {
  it("links the brand image to the home route", () => {
    renderWithRouter(<NavBar />, { route: "/projects" });
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  });

  it("links each section anchor on the home page", () => {
    renderWithRouter(<NavBar />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/#about");
    expect(screen.getByRole("link", { name: "Experience" })).toHaveAttribute("href", "/#experience");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/#projects");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/#contact");
  });

  it("opens social links and the resume in a new tab", () => {
    renderWithRouter(<NavBar />);
    const linkedin = screen.getByRole("link", { name: "Linkedin" });
    const github = screen.getByRole("link", { name: "Github" });
    const resume = screen.getByRole("link", { name: "Resume" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/hnguyentran03/");
    expect(github).toHaveAttribute("href", "https://github.com/hnguyentran03");
    expect(resume).toHaveAttribute("href", "/ben_nguyen_resume.pdf");
    for (const link of [linkedin, github, resume]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("has a toggler that controls the collapse", () => {
    renderWithRouter(<NavBar />);
    expect(screen.getByRole("button", { name: /toggle navigation/i })).toHaveAttribute(
      "aria-controls",
      "basic-navbar-nav"
    );
  });
});
