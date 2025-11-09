import { describe, it, expect } from "vitest";
import { calculateTotalOwed } from "../src/models/loan";

describe("Loan calculations", () => {
  it("calculates total owed with markup", () => {
    expect(calculateTotalOwed(100, 50)).toBe(150);
    expect(calculateTotalOwed(200, 25)).toBe(250);
  });
});