import { describe, expect, it } from "vitest";

import {
  truncateExceptionMessage,
  truncateExceptionStackTrace,
} from "../../src/common/exceptions.js";

describe("Exceptions utils", () => {
  it("Truncate exception message", () => {
    const msg = truncateExceptionMessage("a".repeat(3000));
    expect(msg.length).toBe(2048);
    expect(msg).toContain("(truncated)");
  });

  it("Truncate exception stack trace", () => {
    const longStack =
      "Error: test\n" + "    at someFunction (file.js:1:1)\n".repeat(3000);
    const stackTrace = truncateExceptionStackTrace(longStack);
    expect(stackTrace.length).toBeLessThanOrEqual(65536);
    expect(stackTrace).toContain("(truncated)");
  });
});
