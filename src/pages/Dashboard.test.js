import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
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
  localStorage.setItem("token", createToken());
  localStorage.setItem("role", "USER");
  localStorage.setItem("username", "tester");
});

test("shows approved loan alert badge for unseen approved loans", async () => {
  localStorage.setItem("approved_loan_ids_seen", JSON.stringify([1]));

  API.get.mockResolvedValue({
    data: [
      { id: 1, status: "APPROVED" },
      { id: 2, status: "APPROVED" },
      { id: 3, status: "PENDING" },
    ],
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Dashboard />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByText(/loan alert: 1 request was approved/i)).toBeInTheDocument()
  );
  expect(screen.getByLabelText(/1 approved loan alerts/i)).toBeInTheDocument();
});

test("does not show approved alert badge when there are no unseen approvals", async () => {
  localStorage.setItem("approved_loan_ids_seen", JSON.stringify([1, 2]));

  API.get.mockResolvedValue({
    data: [
      { id: 1, status: "APPROVED" },
      { id: 2, status: "APPROVED" },
    ],
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Dashboard />
    </MemoryRouter>
  );

  await waitFor(() => expect(API.get).toHaveBeenCalledWith("/loans"));
  expect(screen.queryByText(/loan alert:/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/approved loan alerts/i)).not.toBeInTheDocument();
});
