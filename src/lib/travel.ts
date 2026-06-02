/**
 * Pure helpers for the travel map. No DOM, no React.
 * Tested in travel.test.ts.
 */

import type { VisitedCountry } from "./profile";

export function lookupById(
  countries: readonly VisitedCountry[],
  id: string,
): VisitedCountry | undefined {
  if (!id) return undefined;
  return countries.find((c) => c.id === id);
}

export function isVisited(
  countries: readonly VisitedCountry[],
  id: string,
): boolean {
  return lookupById(countries, id) !== undefined;
}

export function sortedVisited(
  countries: readonly VisitedCountry[],
): VisitedCountry[] {
  return [...countries].sort((a, b) => a.name.localeCompare(b.name));
}
