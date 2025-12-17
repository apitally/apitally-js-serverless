import { ApitallyConsumer } from "./consumers.js";

export type OutputData = {
  instanceUuid: string;
  requestUuid: string;
  startup?: {
    paths: { method: string; path: string }[];
    client: string;
  };
  request: {
    path: string;
    headers?: [string, string][];
    size?: number;
    consumer?: ApitallyConsumer | string | null;
    body?: Buffer;
  };
  response: {
    responseTime: number;
    headers?: [string, string][];
    size?: number;
    body?: Buffer;
  };
};

async function gzipBase64(obj: any) {
  const json = JSON.stringify(obj);
  const encoder = new TextEncoder();

  const gzipStream = new CompressionStream("gzip");
  const writer = gzipStream.writable.getWriter();
  writer.write(encoder.encode(json));
  writer.close();

  const compressed = await new Response(gzipStream.readable).arrayBuffer();

  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

export async function logData(data: OutputData) {
  // Serialize request and response body to base64
  [data.request?.body, data.response?.body].forEach((body) => {
    if (body) {
      // @ts-expect-error Override Buffer's default JSON serialization
      body.toJSON = function () {
        return this.toString("base64");
      };
    }
  });

  console.log(`apitally:${await gzipBase64(data)}`);
}
