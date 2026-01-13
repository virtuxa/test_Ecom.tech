import * as fs from "node:fs";

import { readLines } from "./read.js";
import { parseLine } from "./utils/parseLine.js";
import type { AnalyzeOptions, Report } from "./types/interface.js";
import { StatsCollector } from "./utils/collector.js";

function isPositiveInt(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value > 0;
}

export async function analyzeStream(
  input: NodeJS.ReadableStream,
  options: AnalyzeOptions = {},
): Promise<Report> {
  const strict = options.strict ?? false;
  const topN = options.topN ?? 3;
  if (!isPositiveInt(topN)) {
    throw new Error(`Invalid topN: ${String(options.topN)}`);
  }

  const maxInvalidLines = options.maxInvalidLines ?? Number.POSITIVE_INFINITY;
  if (
    maxInvalidLines !== Number.POSITIVE_INFINITY &&
    !(Number.isFinite(maxInvalidLines) && Number.isInteger(maxInvalidLines) && maxInvalidLines >= 0)
  ) {
    throw new Error(
      `Invalid maxInvalidLines: ${String(options.maxInvalidLines)}`,
    );
  }

  const collector = new StatsCollector();
  let invalidLines = 0;

  for await (const line of readLines(input)) {
    collector.onLine();

    const parsed = parseLine(line);
    if (!parsed.ok) {
      collector.onInvalidLine();
      invalidLines += 1;

      if (strict) {
        throw new Error(`Invalid line (${parsed.error.code}): ${parsed.error.message}`);
      }
      if (invalidLines > maxInvalidLines) {
        throw new Error(`Too many invalid lines (> ${maxInvalidLines})`);
      }
      continue;
    }

    collector.onEvent(parsed.value);
  }

  return collector.finalize(topN);
}

export async function analyzeFile(filePath: string, options: AnalyzeOptions = {}): Promise<Report> {
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  try {
    return await analyzeStream(stream, options);
  } finally {
    stream.destroy();
  }
}
