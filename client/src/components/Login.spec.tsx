import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "../utils/test-utils";
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
    vi.mocked(authUtils.hashCredentialForAuth).mockImplementation(
      async (value: string) => `sha256:${value}`,
    );
  });

  it("should render login form", () => {
    render(<Login />);

    expect(screenn.getByText("Welcome back")).toBeInTheDocument();
    expect(screenn.getByPlaceholderText("Your username")).toBeInTheDocument();
    expect(screenn.getByPlaceholderText("Your password")).toBeInTheDocument();
    expect(
      screenn.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should submit login with valid credentials", async () => {
    const user = userEvent.setup();

    mockAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: "mock-token",
        id: "user-123",
        user: {
          id: "user-123",
          companies: ["company-1"],
        },
      },
    });

    vi.spyOn(authUtils, "setAccessToken").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "markActivity").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "setUserCompanies").mockImplementation(vi.fn());
    vi.spyOn(authUtils, "setUserId").mockImplementation(vi.fn());

    vi.stubGlobal("location", { href: "" } as Location);

    render(<Login />);

    const usernameInput = screenn.getByPlaceholderText("Your username");
    const passwordInput = screenn.getByPlaceholderText("Your password");
    const submitButton = screenn.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/signin"),
        {
          username: "sha256:testuser",
          password: "sha256:password123",
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
  });

  it("should display error message on login failure", async () => {
    const user = userEvent.setup();

    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
      isAxiosError: true,
    });
    mockAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: "Invalid credentials" },
      },
      isAxiosError: true,
    });

    render(<Login />);

    const usernameInput = screenn.getByPlaceholderText("Your username");
    const passwordInput = screenn.getByPlaceholderText("Your password");
    const submitButton = screenn.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screenn.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    let resolveSignin: (value: unknown) => void = () => {};

    mockAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignin = resolve;
        }),
    );

    render(<Login />);

    const usernameInput = screenn.getByPlaceholderText("Your username");
    const passwordInput = screenn.getByPlaceholderText("Your password");
    const submitButton = screenn.getByRole("button", { name: /sign in/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "password123");
    const clickPromise = user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute("data-loading", "true");
    });

    resolveSignin({
      data: {
        accessToken: "mock-token",
        user: {
          id: "user-123",
          companies: ["company-1"],
        },
      },
      status: 200,
    });

    await clickPromise;
  });
});
