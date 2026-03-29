import { vi } from "vitest";
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";

// Make screen and waitFor available globally
globalThis.screenn = screen;
globalThis.waitFor = waitFor;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
