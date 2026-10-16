import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";

import { ProjectGrid } from "./ProjectGrid";
import styles from "./Projects.module.css";
import { renderWithRouter } from "../../test/renderWithRouter";
import { fixtureProjects } from "../../test/fixtures";

const cardWrapper = (title) => screen.getByRole("heading", { level: 3, name: title }).closest(`.${styles.project}`);

describe("ProjectGrid", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders one card per project", () => {
    renderWithRouter(<ProjectGrid projects={fixtureProjects} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("applies the extra className to the grid", () => {
    const { container } = renderWithRouter(<ProjectGrid projects={fixtureProjects} className="extra" />);
    expect(container.firstChild).toHaveClass(styles.projects, "extra");
  });

  it("highlights a card on hover and clears it 300ms after leaving", () => {
    renderWithRouter(<ProjectGrid projects={fixtureProjects} />);
    const alpha = cardWrapper("Alpha Project");

    fireEvent.mouseEnter(alpha);
    expect(alpha).toHaveClass(styles.projectHovered);

    fireEvent.mouseLeave(alpha);
    expect(alpha).toHaveClass(styles.projectHovered);

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(alpha).toHaveClass(styles.projectHovered);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(alpha).not.toHaveClass(styles.projectHovered);
  });

  it("moving quickly from one card to another cancels the pending clear", () => {
    renderWithRouter(<ProjectGrid projects={fixtureProjects} />);
    const alpha = cardWrapper("Alpha Project");
    const beta = cardWrapper("Beta Project");

    fireEvent.mouseEnter(alpha);
    fireEvent.mouseLeave(alpha);
    fireEvent.mouseEnter(beta);
    expect(beta).toHaveClass(styles.projectHovered);
    expect(alpha).not.toHaveClass(styles.projectHovered);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(beta).toHaveClass(styles.projectHovered);
  });
});
