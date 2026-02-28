import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Support from "./Support";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("renders contact details and FAQ sections", async () => {
  API.get.mockResolvedValue({ data: [] });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Support />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByText(/contact details/i)).toBeInTheDocument()
  );

  expect(screen.getByText(/\+1 \(800\) 555-0148/i)).toBeInTheDocument();
  expect(screen.getByText(/help@bankcore\.example/i)).toBeInTheDocument();
  expect(screen.getByText(/how fast are transfers processed/i)).toBeInTheDocument();
});

test("sends a support message from chat form", async () => {
  API.get.mockResolvedValue({ data: [] });
  API.post.mockResolvedValue({ data: {} });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Support />
    </MemoryRouter>
  );

  await waitFor(() => expect(API.get).toHaveBeenCalledWith("/support/messages/me"));

  fireEvent.change(screen.getByPlaceholderText(/write your message/i), {
    target: { value: "Need urgent help" },
  });
  fireEvent.click(screen.getByRole("button", { name: /send/i }));

  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/support/messages", {
      message: "Need urgent help",
    })
  );
});
