import { describe, expect, test, vi } from "vitest";
import { getEntriesInRange } from "./lib";
import allEntries from "parse-hamlet/entries.json";

describe("lib", () => {
  describe("getEntriesInRange", () => {
    test("basic", () => {
      const entries = getEntriesInRange(10, { before: 1, after: 1 });
      expect(entries).toHaveLength(3);
      expect(entries[0].index).toBe(9);
      expect(entries[1].index).toBe(10);
      expect(entries[2].index).toBe(11);
    });

    test("basic, 3,2", () => {
      const entries = getEntriesInRange(10, { before: 3, after: 2 });
      expect(entries).toHaveLength(6);
      expect(entries[0].index).toBe(7);
      expect(entries[1].index).toBe(8);
      expect(entries[2].index).toBe(9);
      expect(entries[3].index).toBe(10);
      expect(entries[4].index).toBe(11);
      expect(entries[5].index).toBe(12);
    });

    test("entryIndex=1, before=1", () => {
      const entries = getEntriesInRange(1, { before: 1, after: 1 });
      expect(entries).toHaveLength(2);
      expect(entries[0].index).toBe(1);
      expect(entries[1].index).toBe(2);
    });
    test("entryIndex=1, before=2", () => {
      const entries = getEntriesInRange(1, { before: 2, after: 1 });
      expect(entries).toHaveLength(2);
      expect(entries[0].index).toBe(1);
      expect(entries[1].index).toBe(2);
    });

    test("entryIndex=last, after=1", () => {
      const lastIndex = allEntries[allEntries.length - 1].index;
      const entries = getEntriesInRange(lastIndex, { before: 1, after: 1 });
      expect(entries).toHaveLength(2);
      expect(entries[0].index).toBe(lastIndex - 1);
      expect(entries[1].index).toBe(lastIndex);
    });
    test("entryIndex=last, after=2", () => {
      const lastIndex = allEntries[allEntries.length - 1].index;
      const entries = getEntriesInRange(lastIndex, { before: 1, after: 2 });
      expect(entries).toHaveLength(2);
      expect(entries[0].index).toBe(lastIndex - 1);
      expect(entries[1].index).toBe(lastIndex);
    });
  });
});
