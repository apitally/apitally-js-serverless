import { describe, expect, it } from "vitest";

import { bytesToString, stringToBytes } from "../../src/common/bytes.js";
import { captureResponse } from "../../src/common/response.js";

describe("Response utils", () => {
  it("Capture response", async () => {
    const body = "Hello world";
    const response = new Response(body);

    const [newResponse, promise] = captureResponse(response, {
      captureBody: true,
      maxBodySize: 1024,
    });
    const responseText = await newResponse.text();
    const capturedResponse = await promise;
    expect(responseText).toBe(body);
    expect(capturedResponse.body).toEqual(stringToBytes(body));
    expect(capturedResponse.size).toBe(body.length);
    expect(capturedResponse.completed).toBe(true);
  });

  it("Capture response (body too large)", async () => {
    const body = "Hello world";
    const response = new Response(body);

    const [newResponse, promise] = captureResponse(response, {
      captureBody: true,
      maxBodySize: 8,
    });
    const responseText = await newResponse.text();
    const capturedResponse = await promise;
    expect(responseText).toBe(body);
    expect(bytesToString(capturedResponse.body!)).toBe("<body too large>");
    expect(capturedResponse.size).toBe(body.length);
  });
});
