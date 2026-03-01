import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import API from "../services/api";

const mockNavigate = jest.fn();

jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("shows validation error when passwords do not match", async () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ForgotPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/^username$/i), {
    target: { value: "jane" },
  });
  fireEvent.change(screen.getByLabelText(/^new password$/i), {
    target: { value: "newpass1" },
  });
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
    target: { value: "different" },
  });

  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  expect(await screen.findByText(/confirm password does not match/i)).toBeInTheDocument();
  expect(API.post).not.toHaveBeenCalled();
});

test("submits forgot password request", async () => {
  API.post.mockResolvedValue({ data: "Password updated successfully. Please login." });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ForgotPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/^username$/i), {
    target: { value: "jane" },
  });
  fireEvent.change(screen.getByLabelText(/^new password$/i), {
    target: { value: "newpass1" },
  });
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
    target: { value: "newpass1" },
  });

  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/auth/forgot-password", {
      username: "jane",
      newPassword: "newpass1",
    })
  );

  expect(
    await screen.findByText(/password updated successfully\. please login\./i)
  ).toBeInTheDocument();
});
