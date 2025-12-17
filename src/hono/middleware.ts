import { Hono } from "hono";
import { MiddlewareHandler } from "hono/types";

import { ApitallyConfig, mergeConfigWithDefaults } from "../common/config.js";
import {
  convertHeaders,
  isSupportedContentType,
  parseContentLength,
} from "../common/headers.js";
import { logData } from "../common/output.js";
import { captureResponse } from "../common/response.js";
import { getConsumer, listEndpoints, tryWaitUntil } from "./utils.js";

export function useApitally(app: Hono, config?: Partial<ApitallyConfig>) {
  const mergedConfig = mergeConfigWithDefaults(config);
  let isFirstRequest = true;
  let instanceUuid: string;

  const middleware: MiddlewareHandler = async (c, next) => {
    const startTime = performance.now();

    await next();

    const [newResponse, responsePromise] = captureResponse(c.res, {
      captureBody:
        mergedConfig.logResponseBody &&
        isSupportedContentType(c.res.headers.get("content-type")),
    });
    const responseHeaders = newResponse.headers;
    c.res = newResponse;

    const loggingPromise = responsePromise.then(async (capturedResponse) => {
      const responseTime = performance.now() - startTime;
      const requestSize = parseContentLength(c.req.header("content-length"));
      const requestContentType = c.req.header("content-type");
      const requestBody =
        mergedConfig.logRequestBody &&
        isSupportedContentType(requestContentType)
          ? Buffer.from(await c.req.arrayBuffer())
          : undefined;
      const responseSize = capturedResponse.completed
        ? capturedResponse.size
        : undefined;
      const responseBody = capturedResponse.body;

      let startupData: any;
      if (isFirstRequest) {
        isFirstRequest = false;
        instanceUuid = crypto.randomUUID();
        startupData = {
          paths: listEndpoints(app),
          client: "js:serverless:hono",
        };
      }
      const requestData = {
        path: c.req.routePath,
        headers: mergedConfig.logRequestHeaders
          ? convertHeaders(c.req.header())
          : undefined,
        size: requestSize,
        consumer: getConsumer(c),
        body: requestBody,
      };
      const responseData = {
        responseTime,
        headers: mergedConfig.logResponseHeaders
          ? convertHeaders(responseHeaders)
          : undefined,
        size: responseSize,
        body: responseBody,
      };
      await logData({
        instanceUuid,
        requestUuid: crypto.randomUUID(),
        startup: startupData,
        request: requestData,
        response: responseData,
      });
    });

    tryWaitUntil(c, loggingPromise);
  };

  app.use(middleware);
}
