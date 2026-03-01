import { render, screen } from "@testing-library/react";
import App from "./App";

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
  localStorage.clear();
});

test("renders login for unauthenticated visitors", () => {
  window.history.pushState({}, "", "/login");
  render(<App />);
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});

test("renders support route for authenticated users", () => {
  localStorage.setItem("token", createToken());
  localStorage.setItem("role", "USER");
  localStorage.setItem("username", "tester");
  window.history.pushState({}, "", "/support");

  render(<App />);
  expect(screen.getByText(/customer support/i)).toBeInTheDocument();
});

test("renders forgot password page route", () => {
  window.history.pushState({}, "", "/forgot-password");
  render(<App />);
  expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
});
