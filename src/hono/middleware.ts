import { Hono } from "hono";
import { MiddlewareHandler } from "hono/types";

import { stringToBytes } from "../common/bytes.js";
import { ApitallyConfig, mergeConfigWithDefaults } from "../common/config.js";
import {
  convertHeaders,
  isSupportedContentType,
  parseContentLength,
} from "../common/headers.js";
import DataMasker from "../common/masking.js";
import { logData, OutputData, ValidationError } from "../common/output.js";
import { captureResponse, getResponseJson } from "../common/response.js";
import { VERSION } from "../common/version.js";
import {
  extractZodErrors,
  getConsumer,
  listEndpoints,
  tryWaitUntil,
} from "./utils.js";

export function useApitally(app: Hono, config?: Partial<ApitallyConfig>) {
  const mergedConfig = mergeConfigWithDefaults(config);
  const masker = new DataMasker(mergedConfig);
  let isFirstRequest = true;
  let instanceUuid: string;

  const middleware: MiddlewareHandler = async (c, next) => {
    const startTime = performance.now();

    await next();

    const maybeValidationErrors =
      c.res.status === 400 &&
      c.res.headers.get("content-type") === "application/json";
    const [newResponse, responsePromise] = captureResponse(c.res, {
      captureBody:
        (mergedConfig.logResponseBody &&
          isSupportedContentType(c.res.headers.get("content-type"))) ||
        maybeValidationErrors,
    });
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
            ? new Uint8Array(await c.req.arrayBuffer())
            : stringToBytes("<body too large>")
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

      let validationErrors: ValidationError[] | undefined;
      if (c.res.status === 400 && capturedResponse.body) {
        const responseJson = getResponseJson(capturedResponse.body);
        validationErrors = extractZodErrors(responseJson);
      }

      const consumer = getConsumer(c);
      const data: OutputData = {
        instanceUuid,
        requestUuid: crypto.randomUUID(),
        startup: startupData,
        consumer: typeof consumer === "object" ? consumer : undefined,
        request: {
          path: c.req.routePath,
          headers: convertHeaders(c.req.header()),
          size: requestSize,
          consumer:
            typeof consumer === "object" ? consumer.identifier : consumer,
          body: requestBody,
        },
        response: {
          responseTime: responseTime / 1000,
          headers: convertHeaders(c.res.headers),
          size: responseSize,
          body: responseBody,
        },
        validationErrors,
      };

      masker.applyMasking(data);
      await logData(data);
    });

    tryWaitUntil(c, loggingPromise);
  };

  app.use(middleware);
}
