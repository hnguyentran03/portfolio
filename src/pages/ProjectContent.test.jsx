import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { ProjectContent, ProjectMarkdown } from "./ProjectContent";
import projects from "../data/projects.json";
import styles from "./ProjectPage.module.css";

describe("ProjectMarkdown", () => {
  it("renders headings and GFM tables", () => {
    const { container } = render(
      <ProjectMarkdown content={"## Features\n\n| A | B |\n|---|---|\n| 1 | 2 |"} />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Features" })).toBeInTheDocument();
    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("resolves relative image paths through the assets directory", () => {
    render(<ProjectMarkdown content={"![Screenshot](projects/tetris.png)"} />);
    expect(screen.getByRole("img", { name: "Screenshot" })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/assets\/projects\/tetris\.png$/)
    );
  });

  it("passes absolute URLs through untouched", () => {
    render(<ProjectMarkdown content={"![Remote](https://example.com/x.png)"} />);
    expect(screen.getByRole("img", { name: "Remote" })).toHaveAttribute("src", "https://example.com/x.png");
  });

  it("renders mp4 and webm references as videos", () => {
    const { container } = render(<ProjectMarkdown content={"![](projects/clip.mp4)\n\n![](projects/clip.webm)"} />);
    const videos = container.querySelectorAll("video");
    expect(videos).toHaveLength(2);
    expect(videos[0]).toHaveAttribute("controls");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("wraps raw iframes in an embed container", () => {
    const { container } = render(
      <ProjectMarkdown content={'<iframe src="https://www.youtube.com/embed/abc" title="yt"></iframe>'} />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/abc");
    expect(iframe.parentElement).toHaveClass(styles.embed);
  });
});

describe("ProjectContent", () => {
  it("renders the real content file for a known slug", () => {
    const { slug, description } = projects[0];
    const { container } = render(<ProjectContent slug={slug} fallback={description} />);
    expect(screen.queryByText(description)).not.toBeInTheDocument();
    expect(container.querySelectorAll("h2, h3, p, ul").length).toBeGreaterThan(0);
  });

  it("falls back to the short description for an unknown slug", () => {
    render(<ProjectContent slug="no-such-project" fallback="Fallback text" />);
    expect(screen.getByText("Fallback text")).toBeInTheDocument();
  });
});
