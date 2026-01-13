import type { LogEvent, ParseError, ParseResult } from "../types/interface.js";

function parseKeyValue(token: string): [key: string, value: string] | null {
  const equalsIndex = token.indexOf("=");
  if (equalsIndex <= 0) return null;
  const key = token.slice(0, equalsIndex).trim();
  if (!key) return null;
  const value = token.slice(equalsIndex + 1);
  return [key, value];
}

function makeError(code: ParseError["code"], message: string, line: string): ParseResult<never> {
  return { ok: false, error: { code, message, line } };
}

export function parseLine(line: string): ParseResult<LogEvent> {
  const trimmed = line.trim();
  if (trimmed.length === 0) return makeError("empty_line", "Empty line", line);

  const parts = trimmed.split(/\s+/g);
  const timestamp = parts[0];
  if (!timestamp) return makeError("missing_timestamp", "Missing timestamp", line);
  if (Number.isNaN(Date.parse(timestamp))) {
    return makeError("invalid_timestamp", `Invalid timestamp: ${timestamp}`, line);
  }

  const level = parts[1];
  if (!level) return makeError("missing_level", "Missing level", line);

  const fields: Record<string, string> = {};
  for (const token of parts.slice(2)) {
    const kv = parseKeyValue(token);
    if (!kv) return makeError("invalid_kv_pair", `Invalid key=value token: ${token}`, line);
    const [key, value] = kv;
    fields[key] = value;
  }

  return { ok: true, value: { timestamp, level, fields, raw: line } };
}
