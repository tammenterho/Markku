import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../utils/test-utils";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import * as authUtils from "../utils/auth";
import axios from "axios";

vi.mock("axios");
vi.mock("../utils/auth");

const mockAxios = axios as any;

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
    delete (window as any).location;
    (window as any).location = { href: "" };

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

    (window as any).location = originalLocation;
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
