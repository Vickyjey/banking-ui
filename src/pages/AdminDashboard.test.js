import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import API from "../services/api";

const mockNavigate = jest.fn();

jest.mock("../services/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, "confirm").mockImplementation(() => true);
});

afterEach(() => {
  window.confirm.mockRestore();
});

test("redirects to support inbox when customer support box is clicked", async () => {
  API.get.mockImplementation((url) => {
    if (url === "/admin/users") {
      return Promise.resolve({ data: [] });
    }

    if (url === "/admin/accounts") {
      return Promise.resolve({ data: [] });
    }

    if (url === "/admin/transactions") {
      return Promise.resolve({ data: [] });
    }

    if (url === "/support/admin/conversations") {
      return Promise.resolve({
        data: [
          {
            username: "alice",
            latestMessage: "Need support",
            latestTime: "2026-02-28T10:00:00",
            unreadCount: 1,
          },
        ],
      });
    }

    if (url === "/loans") {
      return Promise.resolve({ data: [] });
    }

    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminDashboard />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByText(/1 unread messages/i)).toBeInTheDocument()
  );

  fireEvent.click(screen.getByRole("button", { name: /open support inbox/i }));
  expect(mockNavigate).toHaveBeenCalledWith("/admin/support");
});

test("shows user display ids sequentially in admin users table", async () => {
  API.get.mockImplementation((url) => {
    if (url === "/admin/users") {
      return Promise.resolve({
        data: [
          { id: 1, username: "admin", role: "ADMIN" },
          { id: 5, username: "bob", role: "USER" },
        ],
      });
    }
    if (url === "/support/admin/conversations") {
      return Promise.resolve({ data: [] });
    }
    if (url === "/loans") {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminDashboard />
    </MemoryRouter>
  );

  const bobRow = await waitFor(() => screen.getByText("bob"));
  const row = bobRow.closest("tr");
  expect(within(row).getByText("2")).toBeInTheDocument();
});
