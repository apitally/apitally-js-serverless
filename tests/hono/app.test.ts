import { Hono } from "hono";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from "vitest";

import { base64ToBytes, bytesToString } from "../../src/common/bytes.js";
import { getLoggedData, wait } from "../utils.js";
import { getApp } from "./app.js";

describe("Middleware for Hono", () => {
  let app: Hono;
  let consoleLogSpy: MockInstance;

  beforeAll(() => {
    app = getApp();
  });

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log");
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("Logs GET request", async () => {
    const res = await app.request("/hello?name=John&age=20");
    await res.text();
    expect(res.status).toBe(200);

    await wait();

    const loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.instanceUuid).toBeDefined();
    expect(loggedData.requestUuid).toBeDefined();
    expect(loggedData.request.path).toBe("/hello");
    expect(loggedData.response.headers).toContainEqual([
      "content-type",
      "text/plain;charset=UTF-8",
    ]);
    expect(loggedData.response.size).toBeGreaterThan(10);
    expect(bytesToString(base64ToBytes(loggedData.response.body))).toMatch(
      /^Hello John!/,
    );
  });

  it("Logs GET request with param", async () => {
    const res = await app.request("/hello/123");
    await res.text();
    expect(res.status).toBe(200);

    await wait();

    const loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.request.path).toBe("/hello/:id");
  });

  it("Logs POST request with JSON body", async () => {
    const body = JSON.stringify({ name: "John", age: 20 });
    const res = await app.request("/hello", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": body.length.toString(),
      },
    });
    await res.text();
    expect(res.status).toBe(200);

    await wait();

    const loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.request.path).toBe("/hello");
    expect(loggedData.request.headers).toHaveLength(2);
    expect(loggedData.request.headers).toContainEqual([
      "content-type",
      "application/json",
    ]);
    expect(loggedData.request.size).toBe(body.length);
    expect(bytesToString(base64ToBytes(loggedData.request.body))).toMatch(
      /^{"name":"John","age":20}$/,
    );
  });

  it("Logs error response", async () => {
    const res = await app.request("/error");
    await res.text();
    expect(res.status).toBe(500);

    await wait();

    const loggedData = await getLoggedData(consoleLogSpy);
    expect(loggedData).toBeDefined();
    expect(loggedData.request.path).toBe("/error");
  });
});
