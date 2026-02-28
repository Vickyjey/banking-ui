import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSupportInbox from "./AdminSupportInbox";
import API from "../services/api";

const mockNavigate = jest.fn();

jest.mock("../services/api", () => ({
  get: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("opens selected user conversation from support inbox", async () => {
  API.get.mockResolvedValue({
    data: [
      {
        username: "alice",
        latestMessage: "Need help",
        latestTime: "2026-02-28T10:00:00",
        unreadCount: 1,
      },
    ],
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminSupportInbox />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: /alice/i }));

  expect(mockNavigate).toHaveBeenCalledWith("/admin/support/alice");
});
