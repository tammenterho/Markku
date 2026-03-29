import type { waitFor as waitForType } from "@testing-library/react";

declare global {
  interface ScreenQueries {
    getByText(text: string | RegExp, options?): HTMLElement;
    getByPlaceholderText(text: string | RegExp, options?): HTMLElement;
    getByRole(role: string, options?): HTMLElement;
    findByText(text: string | RegExp, options?): Promise<HTMLElement>;
    queryByText(text: string | RegExp, options?): HTMLElement | null;
    getAllByText(text: string | RegExp, options?): HTMLElement[];
  }

  var screenn: ScreenQueries;
  var waitFor: typeof waitForType;
}

export {};
