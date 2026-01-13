import test from "node:test";
import assert from "node:assert/strict";

import { parseLine } from "../src/utils/parseLine.js";

test("parseLine разбирает валидную строку с полями", () => {
  const line = "2024-12-01T12:00:01Z INFO user=42 action=login";
  const result = parseLine(line);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.timestamp, "2024-12-01T12:00:01Z");
  assert.equal(result.value.level, "INFO");
  assert.equal(result.value.fields.user, "42");
  assert.equal(result.value.fields.action, "login");
});

test("parseLine возвращает ошибку для пустых строк", () => {
  const result = parseLine("   ");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, "empty_line");
});

test("parseLine возвращает ошибку для некорректных временных меток", () => {
  const result = parseLine("not-a-date INFO user=1");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, "invalid_timestamp");
});

test("parseLine возвращает ошибку для отсутствующего уровня", () => {
  const result = parseLine("2024-12-01T12:00:01Z");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, "missing_level");
});

test("parseLine возвращает ошибку для некорректных токенов key=value", () => {
  const result = parseLine("2024-12-01T12:00:01Z INFO user=42 badtoken");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error.code, "invalid_kv_pair");
});
