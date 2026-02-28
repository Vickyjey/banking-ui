import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Transactions from "./Transactions";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("loads account-scoped transactions and renders results", async () => {
  API.get.mockResolvedValue({
    data: [
      {
        id: 1,
        fromAccount: "ACC-1001",
        toAccount: "ACC-2002",
        amount: 150.5,
        transactionTime: "2026-02-27T10:00:00",
      },
    ],
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Transactions />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/account number/i), {
    target: { value: "ACC-1001" },
  });
  fireEvent.click(screen.getByRole("button", { name: /load/i }));

  await waitFor(() =>
    expect(API.get).toHaveBeenCalledWith("/transactions/account/ACC-1001")
  );

  await waitFor(() => {
    expect(screen.getByText("ACC-2002")).toBeInTheDocument();
  });
  expect(screen.getByText("150.50")).toBeInTheDocument();
});
