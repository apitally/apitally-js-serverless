import { ApitallyConfig } from "./config.js";
import { OutputData } from "./output.js";

const MASKED = "******";
const EXCLUDE_PATH_PATTERNS = [
  /\/_?healthz?$/i,
  /\/_?health[_-]?checks?$/i,
  /\/_?heart[_-]?beats?$/i,
  /\/ping$/i,
  /\/ready$/i,
  /\/live$/i,
];
const MASK_HEADER_PATTERNS = [
  /auth/i,
  /api-?key/i,
  /secret/i,
  /token/i,
  /cookie/i,
];
const MASK_BODY_FIELD_PATTERNS = [
  /password/i,
  /pwd/i,
  /token/i,
  /secret/i,
  /auth/i,
  /card[-_ ]?number/i,
  /ccv/i,
  /ssn/i,
];

function matchPatterns(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => {
    return pattern.test(value);
  });
}

export default class DataMasker {
  public config: ApitallyConfig;

  constructor(config: ApitallyConfig) {
    this.config = config;
  }

  private shouldExcludePath(urlPath: string) {
    const patterns = [...this.config.excludePaths, ...EXCLUDE_PATH_PATTERNS];
    return matchPatterns(urlPath, patterns);
  }

  private shouldMaskHeader(name: string) {
    const patterns = [...this.config.maskHeaders, ...MASK_HEADER_PATTERNS];
    return matchPatterns(name, patterns);
  }

  private shouldMaskBodyField(name: string) {
    const patterns = [
      ...this.config.maskBodyFields,
      ...MASK_BODY_FIELD_PATTERNS,
    ];
    return matchPatterns(name, patterns);
  }

  private maskHeaders(headers: [string, string][]): [string, string][] {
    return headers.map(([k, v]) => [k, this.shouldMaskHeader(k) ? MASKED : v]);
  }

  private maskBody(data: any): any {
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string" && this.shouldMaskBodyField(key)) {
          result[key] = MASKED;
        } else {
          result[key] = this.maskBody(value);
        }
      }
      return result;
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.maskBody(item));
    }
    return data;
  }

  applyMasking(data: OutputData) {
    // Exclude if path is excluded
    if (this.shouldExcludePath(data.request.path)) {
      data.request.headers = undefined;
      data.request.body = undefined;
      data.response.headers = undefined;
      data.response.body = undefined;
      data.exclude = true;
      return;
    }

    // Mask request and response body fields
    for (const key of ["request", "response"] as const) {
      const bodyData = data[key].body;
      if (!bodyData) {
        continue;
      }

      try {
        const contentType = data[key].headers?.find(
          ([k]) => k.toLowerCase() === "content-type",
        )?.[1];
        if (!contentType || /\bjson\b/i.test(contentType)) {
          const parsedBody = JSON.parse(bodyData.toString());
          const maskedBody = this.maskBody(parsedBody);
          data[key].body = Buffer.from(JSON.stringify(maskedBody));
        } else if (/\bndjson\b/i.test(contentType)) {
          const lines = bodyData
            .toString()
            .split("\n")
            .filter((line) => line.trim());
          const maskedLines = lines.map((line) => {
            try {
              const parsed = JSON.parse(line);
              const masked = this.maskBody(parsed);
              return JSON.stringify(masked);
            } catch {
              return line;
            }
          });
          data[key].body = Buffer.from(maskedLines.join("\n"));
        }
      } catch {
        // If parsing fails, leave body as is
      }
    }

    // Mask request and response headers
    data.request.headers = this.config.logRequestHeaders
      ? this.maskHeaders(data.request.headers || [])
      : undefined;
    data.response.headers = this.config.logResponseHeaders
      ? this.maskHeaders(data.response.headers || [])
      : undefined;
  }
}
