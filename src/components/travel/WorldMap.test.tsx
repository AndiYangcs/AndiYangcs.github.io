import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ReactNode, MouseEvent as RMouseEvent } from "react";
import type { VisitedCountry } from "../../lib/profile";

// --- Mock the map library so jsdom can render the component without d3. ---
vi.mock("@vnedyalk0v/react19-simple-maps", () => {
  const FAKE_GEOS = [
    { id: "578" }, // Norway (visited)
    { id: "036" }, // Australia (visited)
    { id: "999" }, // Unknown (unvisited)
  ];
  return {
    ComposableMap: ({ children }: { children: ReactNode }) => (
      <div data-testid="composable-map">{children}</div>
    ),
    ZoomableGroup: ({
      children,
      onMoveStart,
    }: {
      children: ReactNode;
      onMoveStart?: () => void;
    }) => (
      <div data-testid="zoomable-group" onMouseDown={() => onMoveStart?.()}>
        {children}
      </div>
    ),
    Geographies: ({
      children,
    }: {
      children: (args: { geographies: { rsmKey: string; id: string }[] }) => ReactNode;
    }) =>
      children({
        geographies: FAKE_GEOS.map((g) => ({ rsmKey: `geo-${g.id}`, id: g.id })),
      }),
    Geography: ({
      geography,
      onClick,
      className,
    }: {
      geography: { id: string };
      onClick?: (e: RMouseEvent) => void;
      className?: string;
    }) => (
      <button
        type="button"
        data-testid={`geo-${geography.id}`}
        className={className}
        onClick={onClick}
      >
        country-{geography.id}
      </button>
    ),
  };
});

import { WorldMap } from "./WorldMap";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney"], summary: "home" },
];

beforeEach(() => {
  // Force desktop viewport (matchMedia true → popover, not sheet).
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

describe("WorldMap", () => {
  it("renders the map, visited list, and zoom controls", () => {
    render(<WorldMap countries={FIXTURE} />);
    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Countries visited")).toBeInTheDocument();
  });

  it("opens a popover when a visited country is clicked", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/norway/i);
  });

  it("does NOT open a popover when an unvisited country is clicked", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-999"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the popover on Escape", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the popover when a list item is activated", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByRole("button", { name: /australia/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName(/australia/i);
  });

  it("closes the popover when the map starts panning/zooming", async () => {
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const zg = screen.getByTestId("zoomable-group");
    await user.pointer({ keys: "[MouseLeft>]", target: zg });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the bottom sheet instead of the popover when matchMedia reports mobile", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    const user = userEvent.setup();
    render(<WorldMap countries={FIXTURE} />);
    await user.click(screen.getByTestId("geo-578"));
    expect(await screen.findByTestId("country-sheet-scrim")).toBeInTheDocument();
  });
});
