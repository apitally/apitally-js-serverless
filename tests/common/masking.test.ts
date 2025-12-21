import { describe, expect, it } from "vitest";

import {
  bytesToString,
  stringToBytes,
} from "../../src/common/bytes.js";
import { ApitallyConfig } from "../../src/common/config.js";
import DataMasker from "../../src/common/masking.js";
import { OutputData } from "../../src/common/output.js";

const createConfig = (overrides?: Partial<ApitallyConfig>): ApitallyConfig => ({
  enabled: true,
  logRequestHeaders: true,
  logRequestBody: true,
  logResponseHeaders: true,
  logResponseBody: true,
  maskHeaders: [],
  maskBodyFields: [],
  excludePaths: [],
  ...overrides,
});

const createOutputData = (overrides?: Partial<OutputData>): OutputData => ({
  instanceUuid: "00000000-0000-0000-0000-000000000000",
  requestUuid: "00000000-0000-0000-0000-000000000000",
  request: {
    path: "/test",
    headers: [["content-type", "application/json"]],
    body: stringToBytes('{"username":"john"}'),
  },
  response: {
    responseTime: 0.1,
    headers: [["content-type", "application/json"]],
    body: stringToBytes('{"status":"ok"}'),
  },
  ...overrides,
});

describe("Data masker", () => {
  it("Exclude paths", () => {
    const masker = new DataMasker(
      createConfig({ excludePaths: [/\/excluded$/i] }),
    );

    // Built-in exclusion
    const data1 = createOutputData({ request: { path: "/healthz" } });
    masker.applyMasking(data1);
    expect(data1.exclude).toBe(true);
    expect(data1.request.headers).toBeUndefined();
    expect(data1.request.body).toBeUndefined();

    // Custom exclusion
    const data2 = createOutputData({ request: { path: "/api/excluded" } });
    masker.applyMasking(data2);
    expect(data2.exclude).toBe(true);

    // Non-excluded path
    const data3 = createOutputData({ request: { path: "/api/other" } });
    masker.applyMasking(data3);
    expect(data3.exclude).toBeUndefined();
  });

  it("Headers not logged when disabled", () => {
    const masker = new DataMasker(
      createConfig({ logRequestHeaders: false, logResponseHeaders: false }),
    );
    const data = createOutputData();

    masker.applyMasking(data);

    expect(data.request.headers).toBeUndefined();
    expect(data.response.headers).toBeUndefined();
  });

  it("Bodies not logged when disabled", () => {
    const masker = new DataMasker(
      createConfig({ logRequestBody: false, logResponseBody: false }),
    );
    const data = createOutputData();

    masker.applyMasking(data);

    expect(data.request.body).toBeUndefined();
    expect(data.response.body).toBeUndefined();
  });

  it("Mask headers", () => {
    const masker = new DataMasker(createConfig({ maskHeaders: [/x-custom/i] }));
    const data = createOutputData({
      request: {
        path: "/test",
        headers: [
          ["accept", "application/json"],
          ["authorization", "Bearer token"], // built-in
          ["x-custom-header", "secret"], // custom
        ],
      },
    });

    masker.applyMasking(data);

    expect(data.request.headers).toContainEqual(["accept", "application/json"]);
    expect(data.request.headers).toContainEqual(["authorization", "******"]);
    expect(data.request.headers).toContainEqual(["x-custom-header", "******"]);
  });

  it("Mask body fields (JSON)", () => {
    const masker = new DataMasker(
      createConfig({ maskBodyFields: [/custom/i] }),
    );
    const requestBody = {
      username: "john",
      password: "secret", // built-in
      custom: "value", // custom
      nested: { token: "nested" },
      array: [{ auth: "array" }],
    };

    const data = createOutputData({
      request: {
        path: "/test",
        headers: [["content-type", "application/json"]],
        body: stringToBytes(JSON.stringify(requestBody)),
      },
    });

    masker.applyMasking(data);

    const masked = JSON.parse(bytesToString(data.request.body!));
    expect(masked.username).toBe("john");
    expect(masked.password).toBe("******");
    expect(masked.custom).toBe("******");
    expect(masked.nested.token).toBe("******");
    expect(masked.array[0].auth).toBe("******");
  });

  it("Mask body fields (NDJSON)", () => {
    const masker = new DataMasker(createConfig());
    const lines = [
      { username: "john", password: "secret1" },
      { username: "jane", token: "abc123" },
    ];

    const data = createOutputData({
      request: {
        path: "/test",
        headers: [["content-type", "application/x-ndjson"]],
        body: stringToBytes(lines.map((l) => JSON.stringify(l)).join("\n")),
      },
    });

    masker.applyMasking(data);

    const masked = bytesToString(data.request.body!)
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(masked[0].username).toBe("john");
    expect(masked[0].password).toBe("******");
    expect(masked[1].token).toBe("******");
  });

  it("Non-JSON body left unchanged", () => {
    const masker = new DataMasker(createConfig());
    const body = "plain text with password=secret";
    const data = createOutputData({
      request: {
        path: "/test",
        headers: [["content-type", "text/plain"]],
        body: stringToBytes(body),
      },
    });

    masker.applyMasking(data);

    expect(bytesToString(data.request.body!)).toBe(body);
  });
});
