import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLoans from "./AdminLoans";
import API from "../services/api";

jest.mock("../services/api", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
}));

test("loads admin loan requests and approves pending loan", async () => {
  jest.spyOn(window, "confirm").mockReturnValue(true);

  let callIndex = 0;
  API.get.mockImplementation((url) => {
    if (url === "/loans") {
      callIndex += 1;
      if (callIndex === 1) {
        return Promise.resolve({
          data: [
            {
              id: 10,
              requestedBy: "alice",
              accountNumber: "ACC-1001",
              loanType: "Home Loan",
              loanAmount: 250000,
              status: "PENDING",
              requestedAt: "2026-02-28T10:00:00",
            },
          ],
        });
      }
      return Promise.resolve({
        data: [
          {
            id: 10,
            requestedBy: "alice",
            accountNumber: "ACC-1001",
            loanType: "Home Loan",
            loanAmount: 250000,
            status: "APPROVED",
            requestedAt: "2026-02-28T10:00:00",
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });
  API.put.mockResolvedValue({ data: {} });
  API.post.mockResolvedValue({ data: {} });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AdminLoans />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: /approve/i }));

  await waitFor(() => expect(API.put).toHaveBeenCalledWith("/loans/10/approve"));
  await waitFor(() =>
    expect(API.post).toHaveBeenCalledWith("/support/messages", {
      username: "alice",
      message: "Your loan request #10 has been approved.",
    })
  );
  await waitFor(() =>
    expect(screen.getByText(/loan 10 approved successfully/i)).toBeInTheDocument()
  );
});
