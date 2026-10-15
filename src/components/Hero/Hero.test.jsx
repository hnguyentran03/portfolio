import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";

import { Hero } from "./Hero";

const FIRST = "Software Engineer";
const TYPE_DELAY = 300; // 300 - Math.random() * 100 with Math.random stubbed to 0
const PAUSE = 1000;

describe("Hero", () => {
  let logSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    // restore mocks first: the clearInterval spy below wraps the *fake*
    // clearInterval, and restoring it after useRealTimers would reinstall it.
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const rotating = () => document.querySelector("span[data-period]");

  it("renders the greeting, contact button, and hero image", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1, name: "Hello, I'm Ben Nguyen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Me" })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("img", { name: "Hero Image" })).toHaveAttribute(
      "src",
      expect.stringMatching(/\/assets\/hero\/heroImage\.png$/)
    );
  });

  it("types the first phrase one character per tick", () => {
    render(<Hero />);
    expect(rotating().textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(TYPE_DELAY);
    });
    expect(rotating().textContent).toBe("S");

    act(() => {
      vi.advanceTimersByTime(TYPE_DELAY);
    });
    expect(rotating().textContent).toBe("So");

    for (let i = 2; i < FIRST.length; i++) {
      act(() => {
        vi.advanceTimersByTime(TYPE_DELAY);
      });
      expect(rotating().textContent).toBe(FIRST.slice(0, i + 1));
    }
    expect(rotating().textContent).toBe(FIRST);
  });

  it("pauses after the full phrase and then starts deleting", () => {
    render(<Hero />);
    for (let i = 0; i < FIRST.length; i++) {
      act(() => {
        vi.advanceTimersByTime(TYPE_DELAY);
      });
      expect(rotating().textContent).toBe(FIRST.slice(0, i + 1));
    }
    expect(rotating().textContent).toBe(FIRST);

    act(() => {
      vi.advanceTimersByTime(PAUSE - 1);
    });
    expect(rotating().textContent).toBe(FIRST);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(rotating().textContent).toBe(FIRST.slice(0, -1));
  });

  it("does not log to the console on every tick", () => {
    render(<Hero />);
    act(() => {
      vi.advanceTimersByTime(TYPE_DELAY * 3);
    });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("clears its interval on unmount", () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(<Hero />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
