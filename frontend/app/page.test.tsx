import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("renders branding and primary calls to action", () => {
    render(<Home />);

    expect(screen.getAllByText("What to read AI").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Welcome to What to read AI/);
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute("href", "/signup");
    expect(screen.getAllByRole("link", { name: /sign up/i }).length).toBeGreaterThan(0);
  });
});
