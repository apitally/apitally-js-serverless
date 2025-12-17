import { describe, expect, it } from "vitest";

import { parseContentLength } from "../../src/common/headers.js";

describe("Header utils", () => {
  it("Parse content length", async () => {
    expect(parseContentLength(100)).toBe(100);
    expect(parseContentLength("100")).toBe(100);
    expect(parseContentLength(["100", "200"])).toBe(100);
    expect(parseContentLength(undefined)).toBeUndefined();
    expect(parseContentLength(null)).toBeUndefined();
    expect(parseContentLength("")).toBeUndefined();
    expect(parseContentLength("abc")).toBeUndefined();
  });
});
