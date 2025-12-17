export type ApitallyConsumer = {
  identifier: string;
  name?: string | null;
  group?: string | null;
};

const seenConsumerHashes = new Set<number>();

function djb2Hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

export const consumerFromStringOrObject = (
  consumer: ApitallyConsumer | string | null | undefined,
): ApitallyConsumer | string | undefined => {
  if (!consumer) {
    return;
  }
  if (typeof consumer === "string") {
    return consumer.trim().substring(0, 128) || undefined;
  }
  if (typeof consumer === "object") {
    const identifier = consumer.identifier?.trim().substring(0, 128);
    if (!identifier) {
      return;
    }
    const name = consumer.name?.trim().substring(0, 64) || undefined;
    const group = consumer.group?.trim().substring(0, 64) || undefined;
    if (!name && !group) {
      return identifier;
    }
    const hash = djb2Hash(`${identifier}||${name || ""}||${group || ""}`);
    if (seenConsumerHashes.has(hash)) {
      return identifier;
    }
    seenConsumerHashes.add(hash);
    return { identifier, name, group };
  }
};
