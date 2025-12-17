export type ApitallyConfig = {
  enabled: boolean;
  logRequestHeaders: boolean;
  logRequestBody: boolean;
  logResponseHeaders: boolean;
  logResponseBody: boolean;
  maskHeaders: RegExp[];
  maskBodyFields: RegExp[];
  maskRequestBodyCallback?: (request: Request) => Buffer | null | undefined;
  maskResponseBodyCallback?: (
    request: Request,
    response: Response,
  ) => Buffer | null | undefined;
  excludePaths: RegExp[];
  excludeCallback?: (request: Request, response: Response) => boolean;
};

const DEFAULT_CONFIG: ApitallyConfig = {
  enabled: false,
  logRequestHeaders: false,
  logRequestBody: false,
  logResponseHeaders: true,
  logResponseBody: false,
  maskHeaders: [],
  maskBodyFields: [],
  excludePaths: [],
};

export function mergeConfigWithDefaults(
  config?: Partial<ApitallyConfig>,
): ApitallyConfig {
  return { ...DEFAULT_CONFIG, ...(config ?? {}) };
}
