import { MockInstance } from "vitest";

export async function getLoggedData(logMock: MockInstance<typeof console.log>) {
  const logMessage = logMock.mock.calls.find((call) =>
    call[0].startsWith("apitally:"),
  )?.[0];
  if (!logMessage) {
    return undefined;
  }

  const binaryString = atob(logMessage.replace("apitally:", ""));
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
