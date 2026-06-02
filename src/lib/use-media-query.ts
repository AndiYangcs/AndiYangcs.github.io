import { useEffect, useState } from "react";

/**
 * Returns whether the given CSS media query currently matches.
 * Safe to call during SSR or when matchMedia is unavailable — returns
 * false in those cases.
 */
export function useMediaQuery(query: string): boolean {
  const get = (): boolean => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (ev: MediaQueryListEvent | { matches: boolean }) => {
      setMatches(ev.matches);
    };
    setMatches(mql.matches);
    mql.addEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
    return () => {
      mql.removeEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
    };
  }, [query]);

  return matches;
}