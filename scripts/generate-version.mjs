#!/usr/bin/env node
/**
 * Write dist/version.json after each `vite build`. The client polls this file
 * at runtime; when the buildId changes it means a new deploy has landed and
 * the user is prompted to refresh. Keeps vite.config.ts untouched (Lovable
 * manages it).
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "dist");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// vite.config.ts already writes this file with the id the Sentry SDK reports
// as its release and the id its source maps upload under. Keep that id so the
// deploy poll, Sentry and the maps all name the same build; only add builtAt.
const versionFile = path.join(outDir, "version.json");
let buildId = randomUUID();
try {
  const existing = JSON.parse(readFileSync(versionFile, "utf8"));
  if (typeof existing?.buildId === "string" && existing.buildId) buildId = existing.buildId;
} catch {
  // No file yet (script run on its own): a fresh id is fine.
}

const payload = {
  buildId,
  builtAt: new Date().toISOString(),
};

writeFileSync(versionFile, JSON.stringify(payload));
console.log(`✓ wrote dist/version.json (buildId=${payload.buildId})`);
