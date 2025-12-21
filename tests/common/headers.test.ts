import { describe, expect, it } from "vitest";

import {
  convertHeaders,
  isSupportedContentType,
  parseContentLength,
} from "../../src/common/headers.js";

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

  it("Convert headers", async () => {
    expect(convertHeaders(undefined)).toEqual([]);
    expect(convertHeaders(new Headers({ "x-foo": "bar" }))).toEqual([
      ["x-foo", "bar"],
    ]);
    expect(convertHeaders({ "x-foo": "bar" })).toEqual([["x-foo", "bar"]]);
    expect(convertHeaders({ "x-foo": ["bar", "baz"] })).toEqual([
      ["x-foo", "bar"],
      ["x-foo", "baz"],
    ]);
    expect(convertHeaders({ "x-foo": 123 })).toEqual([["x-foo", "123"]]);
    expect(convertHeaders({ "x-foo": undefined })).toEqual([]);
  });

  it("Is supported content type", async () => {
    expect(isSupportedContentType("application/json")).toBe(true);
    expect(isSupportedContentType("application/json; charset=utf-8")).toBe(
      true,
    );
    expect(isSupportedContentType("text/plain")).toBe(true);
    expect(isSupportedContentType("text/html")).toBe(true);
    expect(isSupportedContentType("application/octet-stream")).toBe(false);
    expect(isSupportedContentType("image/png")).toBe(false);
    expect(isSupportedContentType(undefined)).toBe(false);
    expect(isSupportedContentType(null)).toBe(false);
  });
});
