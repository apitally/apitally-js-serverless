import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";

import { setConsumer, useApitally } from "../../src/hono/index.js";

export const getApp = () => {
  const app = new Hono();

  useApitally(app, {
    enabled: true,
    logRequestHeaders: true,
    logRequestBody: true,
    logResponseHeaders: true,
    logResponseBody: true,
  });

  app.get(
    "/hello",
    zValidator(
      "query",
      z.object({
        name: z.string().min(2),
        age: z.coerce.number().min(18),
      }),
    ),
    (c) => {
      setConsumer(c, "test");
      console.warn("Console test");
      return c.text(
        `Hello ${c.req.query("name")}! You are ${c.req.query("age")} years old!`,
      );
    },
  );

  app.get("/hello/:id", (c) => {
    return c.text(`Hello ${c.req.param("id")}!`);
  });

  app.post("/hello", async (c) => {
    const requestBody = await c.req.json();
    return c.text(
      `Hello ${requestBody.name}! You are ${requestBody.age} years old!`,
    );
  });

  app.get("/error", () => {
    throw new Error("test");
  });

  app.get("/stream", (c) => {
    return streamText(c, async (stream) => {
      await stream.writeln("Hello");
      await stream.sleep(100);
      await stream.write("world");
    });
  });

  return app;
};
