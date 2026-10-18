import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("./api/health.js", () => ({
  getApiHealth: vi.fn().mockResolvedValue({
    status: "ok",
    service: "fintrack-hub-api",
    timestamp: "2026-01-01T00:00:00.000Z",
    database: "connected"
  })
}));

import App from "./App.jsx";

afterEach(() => cleanup());

describe("application foundation", () => {
  it("renders the app shell and makes project scope clear", () => {
    render(<MemoryRouter><App /></MemoryRouter>);
    expect(screen.getByText(/Make money decisions/)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText(/No sample balances or transactions are shown/)).toBeInTheDocument();
  });

  it("shows later-phase pages as planned rather than pretending they are complete", () => {
    render(<MemoryRouter initialEntries={["/budgets"]}><App /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Budgets" })).toBeInTheDocument();
    expect(screen.getByText(/Phase 4/)).toBeInTheDocument();
  });
});
