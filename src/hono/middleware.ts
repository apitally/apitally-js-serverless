import { Hono } from "hono";
import { MiddlewareHandler } from "hono/types";

import { ApitallyConfig, mergeConfigWithDefaults } from "../common/config.js";
import {
  convertHeaders,
  isSupportedContentType,
  parseContentLength,
} from "../common/headers.js";
import DataMasker from "../common/masking.js";
import { logData } from "../common/output.js";
import { captureResponse } from "../common/response.js";
import { VERSION } from "../common/version.js";
import { getConsumer, listEndpoints, tryWaitUntil } from "./utils.js";

export function useApitally(app: Hono, config?: Partial<ApitallyConfig>) {
  const mergedConfig = mergeConfigWithDefaults(config);
  const masker = new DataMasker(mergedConfig);
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
        requestSize &&
        isSupportedContentType(requestContentType)
          ? requestSize <= 10_000
            ? Buffer.from(await c.req.arrayBuffer())
            : Buffer.from("<body too large>")
          : undefined;
      const responseSize = capturedResponse.completed
        ? capturedResponse.size
        : undefined;
      const responseBody = capturedResponse.body;

      let startupData;
      if (isFirstRequest) {
        isFirstRequest = false;
        instanceUuid = crypto.randomUUID();
        startupData = {
          paths: listEndpoints(app),
          client: "js-serverless:hono",
          versions: {
            "@apitally/serverless": VERSION,
          },
        };
      }

      const data = {
        instanceUuid,
        requestUuid: crypto.randomUUID(),
        startup: startupData,
        request: {
          path: c.req.routePath,
          headers: convertHeaders(c.req.header()),
          size: requestSize,
          consumer: getConsumer(c),
          body: requestBody,
        },
        response: {
          responseTime,
          headers: convertHeaders(responseHeaders),
          size: responseSize,
          body: responseBody,
        },
      };

      masker.applyMasking(data);
      await logData(data);
    });

    tryWaitUntil(c, loggingPromise);
  };

  app.use(middleware);
}
