import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminSupportConversation from "./AdminSupportConversation";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("loads one user conversation and sends admin reply", async () => {
  API.get.mockResolvedValue({
    data: [
      {
        id: 1,
        username: "alice",
        senderRole: "USER",
        message: "hello",
        sentAt: "2026-02-28T10:00:00",
      },
    ],
  });
  API.put.mockResolvedValue({ data: { updated: 1 } });
  API.post.mockResolvedValue({ data: {} });

  render(
    <MemoryRouter
      initialEntries={["/admin/support/alice"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/admin/support/:username" element={<AdminSupportConversation />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(API.get).toHaveBeenCalledWith("/support/admin/messages/alice"));
  await waitFor(() =>
    expect(API.put).toHaveBeenCalledWith("/support/admin/messages/alice/read")
  );
  expect(screen.getByText(/conversation: alice/i)).toBeInTheDocument();
  expect(screen.getByText("hello")).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText(/reply to user/i), {
    target: { value: "I can help" },
  });
  fireEvent.click(screen.getByRole("button", { name: /send reply/i }));

  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/support/messages", {
      username: "alice",
      message: "I can help",
    })
  );
});
