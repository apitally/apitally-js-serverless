import {
  IncomingHttpHeaders,
  OutgoingHttpHeader,
  OutgoingHttpHeaders,
} from "node:http";

export function convertHeaders(
  headers:
    | Headers
    | IncomingHttpHeaders
    | OutgoingHttpHeaders
    | Record<string, string | string[] | number | undefined>
    | undefined,
) {
  if (!headers) {
    return [];
  }
  if (headers instanceof Headers) {
    return Array.from(headers.entries());
  }
  return Object.entries(headers).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map((v) => [key, v]);
    }
    return [[key, value.toString()]];
  }) as [string, string][];
}

export function parseContentLength(
  contentLength: OutgoingHttpHeader | undefined | null,
): number | undefined {
  if (contentLength === undefined || contentLength === null) {
    return undefined;
  }
  if (typeof contentLength === "number") {
    return contentLength;
  }
  if (typeof contentLength === "string") {
    const parsed = parseInt(contentLength);
    return isNaN(parsed) ? undefined : parsed;
  }
  if (Array.isArray(contentLength)) {
    return parseContentLength(contentLength[0]);
  }
  return undefined;
}

export function isSupportedContentType(contentType?: string | null) {
  const ALLOWED_CONTENT_TYPES = [
    "application/json",
    "application/ld+json",
    "application/problem+json",
    "application/vnd.api+json",
    "application/x-ndjson",
    "text/plain",
    "text/html",
  ];

  return (
    typeof contentType === "string" &&
    ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t))
  );
}
