import * as fs from "node:fs";
import { fileURLToPath } from "node:url";

import { analyzeFile } from "./pipeline.js";
import type { AnalyzeOptions, Report, CliOptions } from "./types/interface.js";

function isFlag(arg: string): boolean {
  return arg.startsWith("-");
}

function parseNumberFlag(flag: string, value: string | undefined): number {
  if (value === undefined) throw new Error(`Missing value for ${flag}`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number for ${flag}: ${value}`);
  return parsed;
}

export function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] ?? "";
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }
    if (arg === "--file" || arg === "-f") {
      const value = args[i + 1];
      if (!value || isFlag(value)) throw new Error("Missing value for --file");
      options.filePath = value;
      i += 1;
      continue;
    }
    if (arg === "--top") {
      options.topN = parseNumberFlag("--top", args[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--max-invalid") {
      options.maxInvalidLines = parseNumberFlag("--max-invalid", args[i + 1]);
      i += 1;
      continue;
    }

    if (!isFlag(arg) && !options.filePath) {
      options.filePath = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

export function formatReport(
  report: Report,
  opts: { topN: number },
): string {
  const lines: string[] = [];
  lines.push(`Total lines: ${report.totalLines}`);
  lines.push(`ERROR lines: ${report.errorLines}`);
  lines.push(`Top-${opts.topN} users with ERROR:`);
  if (report.topUsersWithErrors.length === 0) {
    lines.push("(none)");
  } else {
    for (const [index, entry] of report.topUsersWithErrors.entries()) {
      lines.push(`${index + 1}) user=${entry.user} errors=${entry.errors}`);
    }
  }

  return lines.join("\n");
}

function helpText(): string {
  return [
    "Использование:",
    "  node dist/src/start.js --file <path> [--top N] [--strict] [--max-invalid N]",
    "  node dist/src/start.js <path> [--top N] [--strict] [--max-invalid N]",
    "  npm start -- --file <path> [--top N] [--strict] [--max-invalid N]",
    "  npm start -- <path> [--top N] [--strict] [--max-invalid N]",
    "",
    "Примечание:",
    "  --strict       Завершить работу при первой невалидной строке",
    "  --max-invalid  В не-strict режиме завершить работу, если число невалидных строк превышает N",
  ].join("\n");
}

export async function runCli(argv = process.argv): Promise<number> {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      process.stdout.write(`${helpText()}\n`);
      return 0;
    }

    const topN = options.topN ?? 3;

    if (options.filePath === undefined) throw new Error("Missing log file path (use --file)");
    if (!fs.existsSync(options.filePath)) throw new Error(`File not found: ${options.filePath}`);
    if (!fs.statSync(options.filePath).isFile()) throw new Error(`Not a file: ${options.filePath}`);

    const report = await analyzeFile(options.filePath, options);

    process.stdout.write(`${formatReport(report, { topN })}\n`);

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 1;
  }
}

const selfPath = fs.realpathSync(fileURLToPath(import.meta.url));
const entryPath = process.argv[1] ? fs.realpathSync(process.argv[1]) : "";
if (entryPath && entryPath === selfPath) {
  runCli().then((code) => process.exit(code));
}
