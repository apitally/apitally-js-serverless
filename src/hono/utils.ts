import { Context, Hono } from "hono";
import { isMiddleware } from "hono/utils/handler";
import type { ZodError } from "zod";

import {
  ApitallyConsumer,
  consumerFromStringOrObject,
} from "../common/consumers.js";
import { ValidationError } from "../common/output.js";

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
    // Execution context is only available in Cloudflare Workers,
    // but not on other platforms or in unit tests.
  }
}

export function extractZodErrors(responseJson: any) {
  try {
    const errors: ValidationError[] = [];
    if (
      responseJson &&
      responseJson.success === false &&
      responseJson.error &&
      responseJson.error.name === "ZodError"
    ) {
      const zodError = responseJson.error as ZodError;
      zodError.issues?.forEach((zodIssue) => {
        errors.push({
          loc: zodIssue.path.join("."),
          msg: zodIssue.message,
          type: zodIssue.code,
        });
      });
    }
    return errors;
  } catch (error) {
    return [];
  }
}
