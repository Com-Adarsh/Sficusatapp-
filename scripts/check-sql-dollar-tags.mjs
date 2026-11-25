#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ?? "supabase";
const sqlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && full.endsWith(".sql")) sqlFiles.push(full);
  }
}

walk(root);

const tagPattern = /\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/g;
let failed = false;

for (const file of sqlFiles.sort()) {
  const text = fs.readFileSync(file, "utf8");
  const tags = text.match(tagPattern) ?? [];
  const counts = new Map();
  for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);

  for (const [tag, count] of counts) {
    if (count % 2 !== 0) {
      console.error(`UNBALANCED_DOLLAR_TAG ${file}: ${tag} appears ${count} times`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Dollar-quote tag scan passed for ${sqlFiles.length} SQL files.`);
