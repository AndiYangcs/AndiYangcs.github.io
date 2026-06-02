import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./use-media-query";

type Listener = (ev: { matches: boolean }) => void;

interface FakeMediaQueryList {
  matches: boolean;
  addEventListener: (type: "change", listener: Listener) => void;
  removeEventListener: (type: "change", listener: Listener) => void;
  _fire: (matches: boolean) => void;
}

function makeMql(initial: boolean): FakeMediaQueryList {
  const listeners = new Set<Listener>();
  const mql: FakeMediaQueryList = {
    matches: initial,
    addEventListener: (_type, l) => { listeners.add(l); },
    removeEventListener: (_type, l) => { listeners.delete(l); },
    _fire: (matches) => {
      mql.matches = matches;
      listeners.forEach((l) => l({ matches }));
    },
  };
  return mql;
}

describe("useMediaQuery", () => {
  let mql: FakeMediaQueryList;

  beforeEach(() => {
    mql = makeMql(true);
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    });
  });

  it("returns the initial match value", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the media query state changes", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    act(() => mql._fire(false));
    expect(result.current).toBe(false);
  });

  it("returns false when matchMedia is unavailable", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    const mod = await import("./use-media-query");
    const { result } = renderHook(() => mod.useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });
});