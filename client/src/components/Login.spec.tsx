import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../utils/test-utils";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import * as authUtils from "../utils/auth";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    isAxiosError: vi.fn((error: unknown) => {
      return (
        typeof error === "object" && error !== null && "isAxiosError" in error
      );
    }),
  },
}));

vi.mock("../utils/auth");

import axios from "axios";

const mockAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form", () => {
    render(<Login />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should submit login with valid credentials", async () => {
    const user = userEvent.setup();

    mockAxios.post.mockResolvedValueOnce({
      data: { accessToken: "mock-token" },
    });

    mockAxios.get.mockResolvedValueOnce({
      data: {
        id: "user-123",
        companies: ["company-1"],
      },
    });

    vi.spyOn(authUtils, "setAccessToken").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "markActivity").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "setUserCompanies").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "setUserId").mockImplementation(vi.fn());

    const originalLocation = window.location;
    delete (window as unknown as Record<string, unknown>).location;
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    render(<Login />);

    const usernameInput = screen.getByPlaceholderText("Your username");
    const passwordInput = screen.getByPlaceholderText("Your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/signin"),
        {
          username: "testuser",
          password: "password123",
        },
        { withCredentials: true },
      );
    });

    await waitFor(() => {
      expect(authUtils.setAccessToken).toHaveBeenCalledWith("mock-token");
      expect(authUtils.markActivity).toHaveBeenCalled();
      expect(authUtils.setUserCompanies).toHaveBeenCalledWith(["company-1"]);
      expect(authUtils.setUserId).toHaveBeenCalledWith("user-123");
    });

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("should display error message on login failure", async () => {
    const user = userEvent.setup();

    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
      isAxiosError: true,
    });

    render(<Login />);

    const usernameInput = screen.getByPlaceholderText("Your username");
    const passwordInput = screen.getByPlaceholderText("Your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Login failed. Please try again/i),
      ).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    mockAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { accessToken: "mock-token" },
              }),
            100,
          ),
        ),
    );

    mockAxios.get.mockResolvedValueOnce({
      data: {
        id: "user-123",
        companies: ["company-1"],
      },
    });

    render(<Login />);

    const usernameInput = screen.getByPlaceholderText("Your username");
    const passwordInput = screen.getByPlaceholderText("Your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Button should be in loading state
    expect(submitButton).toHaveAttribute("data-loading", "true");
  });
});
