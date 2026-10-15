import { describe, it, expect } from "vitest";
import { getImageUrl } from "./utils";
import styles from "./App.module.css";

describe("getImageUrl", () => {
  it("resolves a path relative to the top-level assets directory", () => {
    expect(getImageUrl("projects/tetris.png")).toMatch(/\/assets\/projects\/tetris\.png$/);
  });

  it("keeps nested folders intact", () => {
    expect(getImageUrl("history/caci.png")).toMatch(/\/assets\/history\/caci\.png$/);
  });
});

it("setup stubs window.scrollTo", () => {
  window.scrollTo(0, 0);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

it("CSS modules resolve to class name strings under Vitest", () => {
  expect(typeof styles.App).toBe("string");
  expect(styles.App.length).toBeGreaterThan(0);
});
