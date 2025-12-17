import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { getLoggedData, wait } from "../utils.js";
import { getApp } from "./app.js";

describe("Middleware for Hono", () => {
  let app: Hono;
  let consoleLogSpy: Mock;

  beforeEach(async () => {
    app = await getApp();
    consoleLogSpy = vi.spyOn(console, "log");
  });

  it("Request logging", async () => {
    let res;
    let loggedData;

    res = await app.request("/hello?name=John&age=20");
    await res.text();
    expect(res.status).toBe(200);

    await wait();

    loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.instanceUuid).toBeDefined();
    expect(loggedData.requestUuid).toBeDefined();
    expect(loggedData.request.path).toBe("/hello");
    expect(loggedData.response.headers).toContainEqual([
      "content-type",
      "text/plain;charset=UTF-8",
    ]);
    expect(loggedData.response.size).toBeGreaterThan(10);
    expect(Buffer.from(loggedData.response.body, "base64").toString()).toMatch(
      /^Hello John!/,
    );
    consoleLogSpy.mockClear();

    res = await app.request("/error");
    await res.text();
    expect(res.status).toBe(500);

    await wait();

    loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.request.path).toBe("/error");
    consoleLogSpy.mockClear();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });
});
