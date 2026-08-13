import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("page has required metadata and local assets", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /<html[^>]+lang="en"/i);
  assert.match(html, /name="viewport"/i);
  assert.match(html, /name="description"/i);
  assert.match(html, /href="styles\.css"/i);
  assert.match(html, /src="script\.js"/i);
  await Promise.all([
    readFile(new URL("styles.css", root)),
    readFile(new URL("script.js", root)),
  ]);
});

test("external links opened in a new tab prevent opener access", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  for (const tag of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    assert.match(tag[0], /rel="[^"]*noopener[^"]*"/i);
  }
});

test("script avoids dynamic code execution", async () => {
  const script = await readFile(new URL("script.js", root), "utf8");
  assert.doesNotMatch(script, /\beval\s*\(|\bnew\s+Function\s*\(/);
});
