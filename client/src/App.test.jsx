import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { getCurrentUser } from "./api/auth.js";
import App from "./App.jsx";

vi.mock("./api/auth.js", () => ({
  getCurrentUser: vi.fn(), loginAccount: vi.fn(), registerAccount: vi.fn(),
  logoutAccount: vi.fn(), updateCurrentUser: vi.fn(), changeAccountPassword: vi.fn()
}));
vi.mock("./api/dashboard.js", () => ({ getDashboardSummary: vi.fn() }));
vi.mock("./api/expenses.js", () => ({
  listExpenses: vi.fn(), createExpense: vi.fn(), updateExpense: vi.fn(), deleteExpense: vi.fn()
}));
vi.mock("./api/budgets.js", () => ({
  listBudgets: vi.fn(), createBudget: vi.fn(), updateBudget: vi.fn(), deleteBudget: vi.fn()
}));
afterEach(() => cleanup());
beforeEach(() => { getCurrentUser.mockRejectedValue(new Error("Unauthenticated")); });
function renderApp(path = "/dashboard") {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><App /></AuthProvider></MemoryRouter>);
}
describe("FinTrack Hub routes", () => {
  it("redirects unauthenticated users to sign in", async () => {
    renderApp();
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });
  it("shows the public registration form", async () => {
    renderApp("/register");
    expect(await screen.findByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByText(/at least 12 characters/i)).toBeInTheDocument();
  });
});
