import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountryPopover } from "./CountryPopover";
import type { VisitedCountry } from "../../lib/profile";

const NORWAY: VisitedCountry = {
  id: "578",
  name: "Norway",
  years: "2024",
  cities: ["Oslo", "Bergen", "Tromsø"],
  summary: "Fjords, fjords, fjords.",
};

describe("CountryPopover", () => {
  it("renders country name, years, cities, and summary", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={() => {}} />);
    expect(screen.getByRole("heading", { name: /norway/i })).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText(/Oslo.*Bergen.*Tromsø/)).toBeInTheDocument();
    expect(screen.getByText(/Fjords, fjords, fjords\./)).toBeInTheDocument();
  });

  it("uses role=dialog with the country name as the accessible name", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
  });

  it("fires onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryPopover country={NORWAY} anchor={{ x: 100, y: 100 }} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("positions itself near the anchor point", () => {
    render(<CountryPopover country={NORWAY} anchor={{ x: 150, y: 200 }} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.left).toMatch(/^\d+px$/);
    expect(dialog.style.top).toMatch(/^\d+px$/);
  });
});