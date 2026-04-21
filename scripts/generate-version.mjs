#!/usr/bin/env node
/**
 * Write dist/version.json after each `vite build`. The client polls this file
 * at runtime; when the buildId changes it means a new deploy has landed and
 * the user is prompted to refresh. Keeps vite.config.ts untouched (Lovable
 * manages it).
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "dist");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const payload = {
  buildId: randomUUID(),
  builtAt: new Date().toISOString(),
};

writeFileSync(path.join(outDir, "version.json"), JSON.stringify(payload));
console.log(`✓ wrote dist/version.json (buildId=${payload.buildId})`);
