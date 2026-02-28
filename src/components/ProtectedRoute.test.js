import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

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

test("redirects to login when token is missing", () => {
  render(
    <MemoryRouter
      initialEntries={["/secure"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/secure"
          element={
            <ProtectedRoute>
              <p>Secure Content</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Login Page</p>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText("Login Page")).toBeInTheDocument();
});

test("blocks user token from admin-only route", () => {
  localStorage.setItem("token", createToken("USER"));
  localStorage.setItem("role", "USER");

  render(
    <MemoryRouter
      initialEntries={["/admin"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <p>Admin Page</p>
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<p>Dashboard Page</p>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
});

test("allows admin token on admin-only route", () => {
  localStorage.setItem("token", createToken("ADMIN"));
  localStorage.setItem("role", "ADMIN");

  render(
    <MemoryRouter
      initialEntries={["/admin"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <p>Admin Page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText("Admin Page")).toBeInTheDocument();
});

test("redirects when token is expired", () => {
  localStorage.setItem("token", createToken("USER", -60));
  localStorage.setItem("role", "USER");

  render(
    <MemoryRouter
      initialEntries={["/secure"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/secure"
          element={
            <ProtectedRoute>
              <p>Secure Content</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Login Page</p>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText("Login Page")).toBeInTheDocument();
});
