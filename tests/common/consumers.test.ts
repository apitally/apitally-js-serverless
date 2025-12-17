import { describe, expect, it } from "vitest";

import { consumerFromStringOrObject } from "../../src/common/consumers.js";

describe("Consumers utils", () => {
  it("consumerFromStringOrObject", () => {
    expect(consumerFromStringOrObject(null)).toBeUndefined();
    expect(consumerFromStringOrObject(" ")).toBeUndefined();
    expect(consumerFromStringOrObject("test")).toBe("test");
    expect(consumerFromStringOrObject({ identifier: "user1" })).toBe("user1");
    expect(
      consumerFromStringOrObject({ identifier: "user2", name: "User Two" }),
    ).toEqual({ identifier: "user2", name: "User Two" });
    expect(
      consumerFromStringOrObject({ identifier: "user2", name: "User Two" }),
    ).toBe("user2");
  });
});
