const MAX_MSG_LENGTH = 2048;
const MAX_STACKTRACE_LENGTH = 65536;

export function truncateExceptionMessage(msg: string) {
  if (msg.length <= MAX_MSG_LENGTH) {
    return msg;
  }
  const suffix = "... (truncated)";
  const cutoff = MAX_MSG_LENGTH - suffix.length;
  return msg.substring(0, cutoff) + suffix;
}

export function truncateExceptionStackTrace(stack: string) {
  if (stack.length <= MAX_STACKTRACE_LENGTH) {
    return stack;
  }
  const suffix = "... (truncated) ...";
  const cutoff = MAX_STACKTRACE_LENGTH - suffix.length;
  const lines = stack.trim().split("\n");
  const truncatedLines: string[] = [];
  let length = 0;
  for (const line of lines) {
    if (length + line.length + 1 > cutoff) {
      truncatedLines.push(suffix);
      break;
    }
    truncatedLines.push(line);
    length += line.length + 1;
  }
  return truncatedLines.join("\n");
}
