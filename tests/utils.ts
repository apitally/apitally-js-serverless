import { MockInstance } from "vitest";

export async function getLoggedData(logMock: MockInstance<typeof console.log>) {
  const msg = logMock.mock.calls.find((call) =>
    call[0].startsWith("apitally:"),
  )?.[0];
  if (!msg) {
    return undefined;
  }

  const binaryString = atob(msg.replace("apitally:", ""));
  const compressed = Uint8Array.from(
    binaryString.split("").map((char) => char.charCodeAt(0)),
  );

  const decompressionStream = new DecompressionStream("gzip");
  const writer = decompressionStream.writable.getWriter();
  writer.write(compressed);
  writer.close();

  const decompressed = await new Response(
    decompressionStream.readable,
  ).arrayBuffer();
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decompressed);

  return JSON.parse(jsonString);
}

export async function wait(ms: number = 20) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
