import { ApitallyConsumer } from "./consumers.js";

export type OutputData = {
  instanceUuid: string;
  requestUuid: string;
  consumer?: ApitallyConsumer;
  startup?: {
    paths: { method: string; path: string }[];
    versions: Record<string, string>;
    client: string;
  };
  request: {
    path: string;
    headers?: [string, string][];
    size?: number;
    consumer?: string | null;
    body?: Buffer;
  };
  response: {
    responseTime: number;
    headers?: [string, string][];
    size?: number;
    body?: Buffer;
  };
  exclude?: boolean;
};

async function gzipBase64(json: string) {
  const encoder = new TextEncoder();
  const gzipStream = new CompressionStream("gzip");
  const writer = gzipStream.writable.getWriter();
  writer.write(encoder.encode(json));
  writer.close();

  const compressed = await new Response(gzipStream.readable).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

async function createLogMessage(data: OutputData) {
  [data.request?.body, data.response?.body].forEach((body) => {
    if (body) {
      // @ts-expect-error Override Buffer's default JSON serialization
      body.toJSON = function () {
        return this.toString("base64");
      };
    }
  });

  const json = JSON.stringify(data);
  return `apitally:${await gzipBase64(json)}`;
}

export async function logData(data: OutputData) {
  let msg = await createLogMessage(data);
  if (msg.length > 15_000) {
    // Cloudflare Workers Logpush limits the total length of all exception and log messages to 16,384 characters,
    // so we need to keep the logged message well below that limit.
    data.request.body = undefined;
    data.response.body = undefined;
    msg = await createLogMessage(data);
  }
  console.log(msg);
}
