import type { waitFor as waitForType } from "@testing-library/react";

declare global {
  interface ScreenQueries {
    getByText(text: string | RegExp, options?: any): HTMLElement;
    getByPlaceholderText(text: string | RegExp, options?: any): HTMLElement;
    getByRole(role: string, options?: any): HTMLElement;
    findByText(text: string | RegExp, options?: any): Promise<HTMLElement>;
    queryByText(text: string | RegExp, options?: any): HTMLElement | null;
    getAllByText(text: string | RegExp, options?: any): HTMLElement[];
  }

  var screenn: ScreenQueries;
  var waitFor: typeof waitForType;
}

export {};
