import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";

import { analyzeStream } from "../src/pipeline.js";

test("analyzeStream вычисляет итоги, количество ERROR и топ пользователей", async () => {
  const lines = [
    "2024-12-01T12:00:01Z INFO user=42 action=login",
    "2024-12-01T12:00:03Z ERROR user=17 action=pay",
    "2024-12-01T12:00:05Z INFO user=42 action=view",
    "2024-12-01T12:00:06Z ERROR user=17 action=pay",
    "2024-12-01T12:00:07Z ERROR user=42 action=pay",
  ];
  const input = Readable.from([`${lines.join("\n")}\n`]);

  const report = await analyzeStream(input, { topN: 3 });
  assert.equal(report.totalLines, 5);
  assert.equal(report.errorLines, 3);
  assert.deepEqual(report.topUsersWithErrors, [
    { user: "17", errors: 2 },
    { user: "42", errors: 1 },
  ]);
});

test("analyzeStream учитывает невалидные строки в режиме без strict", async () => {
  const lines = [
    "2024-12-01T12:00:01Z INFO user=42 action=login",
    "bad line",
    "2024-12-01T12:00:03Z ERROR user=17 action=pay",
  ];
  const input = Readable.from([`${lines.join("\n")}\n`]);

  const report = await analyzeStream(input, { topN: 3 });
  assert.equal(report.totalLines, 3);
  assert.equal(report.invalidLines, 1);
  assert.equal(report.errorLines, 1);
});

test("analyzeStream завершает работу при ошибке в strict режиме", async () => {
  const lines = [
    "2024-12-01T12:00:01Z INFO user=42 action=login",
    "bad line",
    "2024-12-01T12:00:03Z ERROR user=17 action=pay",
  ];
  const input = Readable.from([`${lines.join("\n")}\n`]);

  await assert.rejects(() => analyzeStream(input, { strict: true }), /Неверная строка/);
});

test("analyzeStream останавливается при превышении maxInvalidLines", async () => {
  const input = Readable.from(["bad line 1\nbad line 2\nbad line 3\n"]);
  await assert.rejects(
    () => analyzeStream(input, { maxInvalidLines: 2, strict: false }),
    /Слишком много невалидных строк/,
  );
});
