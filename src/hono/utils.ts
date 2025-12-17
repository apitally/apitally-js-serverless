import { Context, Hono } from "hono";
import { isMiddleware } from "hono/utils/handler";
import {
  ApitallyConsumer,
  consumerFromStringOrObject,
} from "../common/consumers.js";

export function listEndpoints(app: Hono) {
  const endpoints: Array<{ method: string; path: string }> = [];
  app.routes.forEach((route) => {
    if (
      !["ALL", "HEAD", "OPTIONS"].includes(route.method.toUpperCase()) &&
      !isMiddleware(route.handler)
    ) {
      endpoints.push({
        method: route.method.toUpperCase(),
        path: route.path,
      });
    }
  });
  return endpoints;
}

export function setConsumer(
  c: Context,
  consumer: ApitallyConsumer | string | null | undefined,
) {
  c.set("apitallyConsumer", consumer || undefined);
}

export function getConsumer(c: Context) {
  return consumerFromStringOrObject(c.get("apitallyConsumer"));
}

export function tryWaitUntil(c: Context, promise: Promise<unknown>) {
  try {
    c.executionCtx.waitUntil(promise);
  } catch (error) {
    // ignore
  }
}
