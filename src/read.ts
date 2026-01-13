import * as readline from "node:readline";

export async function* readLines(
  input: NodeJS.ReadableStream,
): AsyncGenerator<string, void, void> {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  try {
    for await (const line of rl) yield line;
  } finally {
    rl.close();
  }
}
