import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Withdraw from "./Withdraw";
import API from "../services/api";

jest.mock("../services/api", () => ({
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("withdraws amount and shows success message", async () => {
  API.post.mockResolvedValue({
    data: "Withdrawn Successfully. Updated Balance: 750.0",
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Withdraw />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/account number/i), {
    target: { value: "ACC-1001" },
  });
  fireEvent.change(screen.getByLabelText(/amount/i), {
    target: { value: "250" },
  });
  fireEvent.click(screen.getByRole("button", { name: /withdraw/i }));

  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/accounts/withdraw", {
      accountNumber: "ACC-1001",
      amount: 250,
    })
  );
  await waitFor(() =>
    expect(screen.getByText(/withdrawn successfully/i)).toBeInTheDocument()
  );
});
