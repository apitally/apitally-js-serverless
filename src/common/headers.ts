const SUPPORTED_CONTENT_TYPES = [
  "application/json",
  "application/ld+json",
  "application/problem+json",
  "application/vnd.api+json",
  "application/x-ndjson",
  "text/plain",
  "text/html",
];

export function convertHeaders(
  headers?: Headers | Record<string, string | string[] | number | undefined>,
): [string, string][] {
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
  contentLength?: string | string[] | number | null,
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
  return (
    typeof contentType === "string" &&
    SUPPORTED_CONTENT_TYPES.some((t) => contentType.startsWith(t))
  );
}
