import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import API from "../services/api";

const mockNavigate = jest.fn();

jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function createToken(role = "USER", expOffsetSeconds = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "tester",
    role,
    exp: now + expOffsetSeconds,
  };

  const base64Url = (value) =>
    window
      .btoa(JSON.stringify(value))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  return `${base64Url({ alg: "HS256", typ: "JWT" })}.${base64Url(payload)}.sig`;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("redirects regular users to dashboard after login", async () => {
  API.post.mockResolvedValue({ data: createToken("USER") });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "user1" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "pass1" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
  );
});

test("redirects admins to admin dashboard after login", async () => {
  API.post.mockResolvedValue({ data: createToken("ADMIN") });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "admin1" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "pass2" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true })
  );
});

test("shows incorrect password message when login fails", async () => {
  API.post.mockRejectedValue({
    response: {
      data: {
        message: "Password is incorrect",
      },
    },
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Login />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "wronguser" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "wrongpass" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/password is incorrect/i)).toBeInTheDocument();
});

test("renders forgot password link", () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Login />
    </MemoryRouter>
  );

  expect(screen.getByRole("link", { name: /forgot password\?/i })).toHaveAttribute(
    "href",
    "/forgot-password"
  );
});
