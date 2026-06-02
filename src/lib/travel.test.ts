import { describe, expect, it } from "vitest";
import { lookupById, isVisited, sortedVisited } from "./travel";
import type { VisitedCountry } from "./profile";

const FIXTURE: VisitedCountry[] = [
  { id: "578", name: "Norway", years: "2024", cities: ["Oslo"], summary: "fjords" },
  { id: "036", name: "Australia", years: "2000–", cities: ["Sydney"], summary: "home" },
  { id: "392", name: "Japan", years: "2019", cities: ["Tokyo"], summary: "food" },
];

describe("lookupById", () => {
  it("returns the matching country", () => {
    expect(lookupById(FIXTURE, "578")?.name).toBe("Norway");
  });
  it("returns undefined for unknown ids", () => {
    expect(lookupById(FIXTURE, "999")).toBeUndefined();
  });
  it("returns undefined for empty id", () => {
    expect(lookupById(FIXTURE, "")).toBeUndefined();
  });
});

describe("isVisited", () => {
  it("returns true for visited ids", () => {
    expect(isVisited(FIXTURE, "036")).toBe(true);
  });
  it("returns false for unvisited ids", () => {
    expect(isVisited(FIXTURE, "999")).toBe(false);
  });
});

describe("sortedVisited", () => {
  it("returns countries alphabetised by name", () => {
    const names = sortedVisited(FIXTURE).map((c) => c.name);
    expect(names).toEqual(["Australia", "Japan", "Norway"]);
  });
  it("does not mutate the input array", () => {
    const before = FIXTURE.map((c) => c.id);
    sortedVisited(FIXTURE);
    expect(FIXTURE.map((c) => c.id)).toEqual(before);
  });
});
