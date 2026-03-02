import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Loan from "./Loan";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("loads loans and submits a new loan application", async () => {
  let loadIndex = 0;
  const loanPages = [
    [
      {
        id: 1,
        accountNumber: "ACC-1001",
        loanType: "Personal Loan",
        loanAmount: 5000,
        status: "PENDING",
        requestedBy: "alice",
        requestedAt: "2026-02-28T10:00:00",
      },
    ],
    [
      {
        id: 2,
        accountNumber: "ACC-2002",
        loanType: "Home Loan",
        loanAmount: 9000,
        status: "PENDING",
        requestedBy: "alice",
        requestedAt: "2026-02-28T11:00:00",
      },
      {
        id: 1,
        accountNumber: "ACC-1001",
        loanType: "Personal Loan",
        loanAmount: 5000,
        status: "PENDING",
        requestedBy: "alice",
        requestedAt: "2026-02-28T10:00:00",
      },
    ],
  ];

  API.get.mockImplementation((url) => {
    if (url === "/loans") {
      const data = loanPages[Math.min(loadIndex, loanPages.length - 1)];
      loadIndex += 1;
      return Promise.resolve({ data });
    }

    return Promise.resolve({ data: [] });
  });

  API.post.mockResolvedValue({
    data: {
      id: 2,
      accountNumber: "ACC-2002",
      loanType: "Home Loan",
      loanAmount: 9000,
      status: "PENDING",
    },
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Loan />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText("ACC-1001")).toBeInTheDocument());

  fireEvent.change(screen.getByLabelText(/account number/i), {
    target: { value: "ACC-2002" },
  });
  fireEvent.change(screen.getByLabelText(/loan type/i), {
    target: { value: "Home Loan" },
  });
  fireEvent.change(screen.getByLabelText(/loan amount/i), {
    target: { value: "9000" },
  });
  fireEvent.click(screen.getByRole("button", { name: /apply/i }));

  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/loans", {
      accountNumber: "ACC-2002",
      loanType: "Home Loan",
      loanAmount: 9000,
    })
  );
  await waitFor(() =>
    expect(screen.getByText(/loan application submitted/i)).toBeInTheDocument()
  );
  expect(screen.getByText("ACC-2002")).toBeInTheDocument();
});

test("shows validation error for invalid loan amount", async () => {
  API.get.mockResolvedValue({ data: [] });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Loan />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByText(/no loans submitted yet/i)).toBeInTheDocument()
  );

  fireEvent.change(screen.getByLabelText(/account number/i), {
    target: { value: "ACC-1001" },
  });
  fireEvent.change(screen.getByLabelText(/loan amount/i), {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: /apply/i }));

  expect(screen.getByText(/loan amount must be greater than zero/i)).toBeInTheDocument();
  expect(API.post).not.toHaveBeenCalled();
});

test("shows approval notification when a loan is approved", async () => {
  API.get.mockResolvedValue({
    data: [
      {
        id: 44,
        accountNumber: "ACC-9001",
        loanType: "Home Loan",
        loanAmount: 125000,
        status: "APPROVED",
        requestedBy: "alice",
        requestedAt: "2026-03-02T10:00:00",
      },
    ],
  });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Loan />
    </MemoryRouter>
  );

  await waitFor(() =>
    expect(screen.getByText(/loan 44 has been approved/i)).toBeInTheDocument()
  );
});
