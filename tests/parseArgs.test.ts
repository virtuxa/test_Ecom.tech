import test from "node:test";
import assert from "node:assert/strict";

import { parseArgs } from "../src/start.js";

test("parseArgs accepts stdin via `--file -`", () => {
  const opts = parseArgs(["node", "start.js", "--file", "-"]);
  assert.equal(opts.filePath, "-");
});

test("parseArgs accepts stdin via positional `-`", () => {
  const opts = parseArgs(["node", "start.js", "-"]);
  assert.equal(opts.filePath, "-");
});

test("parseArgs rejects missing value for `--file`", () => {
  assert.throws(
    () => parseArgs(["node", "start.js", "--file"]),
    /Missing value for --file/,
  );
});

test("parseArgs rejects flag-looking value for `--file` (except `-`)", () => {
  assert.throws(
    () => parseArgs(["node", "start.js", "--file", "--top", "3"]),
    /Missing value for --file/,
  );
});
