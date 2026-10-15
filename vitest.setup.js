import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL only auto-cleans when `afterEach` is a global; globals are off here.
afterEach(() => {
  cleanup();
});

// jsdom logs "Not implemented: window.scrollTo" otherwise. Fresh spy per test
// so pages can assert it was called on mount.
beforeEach(() => {
  window.scrollTo = vi.fn();
});
