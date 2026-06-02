import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CountryBottomSheet } from "./CountryBottomSheet";
import type { VisitedCountry } from "../../lib/profile";

const NORWAY: VisitedCountry = {
  id: "578",
  name: "Norway",
  years: "2024",
  cities: ["Oslo", "Bergen"],
  summary: "Cold and quiet.",
};

describe("CountryBottomSheet", () => {
  it("renders country data inside a dialog", () => {
    render(<CountryBottomSheet country={NORWAY} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
    expect(dialog).toHaveTextContent("2024");
    expect(dialog).toHaveTextContent("Oslo, Bergen");
    expect(dialog).toHaveTextContent("Cold and quiet.");
  });

  it("fires onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when the scrim is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.click(screen.getByTestId("country-sheet-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("fires onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CountryBottomSheet country={NORWAY} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});