import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisitedList } from "./VisitedList";
import type { VisitedCountry } from "../../lib/profile";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney", "Melbourne"], summary: "home" },
];

describe("VisitedList", () => {
  it("renders countries alphabetised by name", () => {
    render(<VisitedList countries={FIXTURE} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toContain("Australia");
    expect(buttons[1].textContent).toContain("Norway");
  });

  it("shows year(s) and cities for each country", () => {
    render(<VisitedList countries={FIXTURE} />);
    const norway = screen.getByRole("button", { name: /norway/i });
    expect(norway).toHaveTextContent("2024");
    expect(norway).toHaveTextContent("Oslo");
  });

  it("calls onSelect with the country id when a button is activated", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<VisitedList countries={FIXTURE} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /norway/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe("578");
  });

  it("renders nothing when the list is empty", () => {
    const { container } = render(<VisitedList countries={[]} />);
    expect(container.querySelector("ul")).toBeNull();
  });
});
