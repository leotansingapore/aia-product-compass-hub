#!/usr/bin/env node
/**
 * Post-build guard against the "undefined is not an object (evaluating
 * 't.PomodoroDock')" class of bug.
 *
 * Many of our route + widget components are lazy-loaded via:
 *
 *   lazyWithRetry(() => import("@/x/Foo").then(m => ({ default: m.Foo })))
 *
 * If the source file ever renames or removes the named export, the build still
 * succeeds (TS is fine — `m.Foo` is `any` through the Promise) but the runtime
 * blows up the moment the chunk loads. This script:
 *
 *   1. Scans src/App.tsx for every `.then(m => ({ default: m.NAME }))` pattern.
 *   2. Resolves each import specifier to a source file.
 *   3. Verifies the source file exports the expected name (export const NAME,
 *      export function NAME, export class NAME, or export { NAME, ... }).
 *   4. Verifies the produced dist chunks contain a matching `export{...NAME...}`
 *      so we also catch tree-shaking / rename regressions in the bundler.
 *
 * Exits non-zero on mismatch so CI / Lovable publish blocks deploy.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_FILE = path.join(ROOT, "src/App.tsx");
const DIST_ASSETS = path.join(ROOT, "dist/assets");

const NAMED_LAZY_RE =
  /import\(\s*["']([^"']+)["']\s*\)\s*\.then\(\s*\w+\s*=>\s*\(\s*\{\s*default:\s*\w+\.(\w+)\s*\}\s*\)\s*\)/g;

function resolveSpecifier(spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(ROOT, "src", spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = path.resolve(path.dirname(APP_FILE), spec);
  else return null;

  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  return candidates.find((p) => existsSync(p) && statSync(p).isFile()) ?? null;
}

function sourceExportsName(file, name) {
  const src = readFileSync(file, "utf8");
  const patterns = [
    new RegExp(`export\\s+const\\s+${name}\\b`),
    new RegExp(`export\\s+function\\s+${name}\\b`),
    new RegExp(`export\\s+async\\s+function\\s+${name}\\b`),
    new RegExp(`export\\s+class\\s+${name}\\b`),
    new RegExp(`export\\s+\\{[^}]*\\b${name}\\b[^}]*\\}`),
    new RegExp(`export\\s+\\{[^}]*\\bas\\s+${name}\\b[^}]*\\}`),
  ];
  return patterns.some((re) => re.test(src));
}

function chunkHasExport(name) {
  if (!existsSync(DIST_ASSETS)) return null; // dist not built yet
  const files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith(".js"));
  // Minified rollup output emits exports as: export{A as B,C,D as PomodoroDock}
  // We look for either `as NAME` or a standalone `NAME` inside an export list.
  const asRe = new RegExp(`\\bas\\s+${name}\\b`);
  const bareRe = new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`);
  for (const file of files) {
    const content = readFileSync(path.join(DIST_ASSETS, file), "utf8");
    if (asRe.test(content) || bareRe.test(content)) return file;
  }
  return false;
}

function main() {
  if (!existsSync(APP_FILE)) {
    console.error(`✗ ${APP_FILE} not found`);
    process.exit(2);
  }
  const src = readFileSync(APP_FILE, "utf8");
  const expectations = [];
  for (const m of src.matchAll(NAMED_LAZY_RE)) {
    expectations.push({ specifier: m[1], name: m[2] });
  }
  if (expectations.length === 0) {
    console.log("• No named lazy imports detected in src/App.tsx — nothing to verify.");
    return;
  }

  const checkChunks = existsSync(DIST_ASSETS);
  console.log(
    `→ Verifying ${expectations.length} named lazy export${expectations.length === 1 ? "" : "s"}${
      checkChunks ? " (source + dist chunks)" : " (source only — run after `vite build` to also check chunks)"
    }`,
  );

  const failures = [];
  for (const { specifier, name } of expectations) {
    const file = resolveSpecifier(specifier);
    if (!file) {
      failures.push(`  ✗ ${specifier} → cannot resolve source file`);
      continue;
    }
    if (!sourceExportsName(file, name)) {
      failures.push(`  ✗ ${specifier} → source does not export "${name}" (file: ${path.relative(ROOT, file)})`);
      continue;
    }
    if (checkChunks) {
      const chunkHit = chunkHasExport(name);
      if (chunkHit === false) {
        failures.push(`  ✗ ${specifier} → "${name}" missing from dist/assets/*.js chunks`);
        continue;
      }
    }
    console.log(`  ✓ ${name} (${path.relative(ROOT, file)})`);
  }

  if (failures.length) {
    console.error(`\n✗ ${failures.length} export mismatch${failures.length === 1 ? "" : "es"}:`);
    failures.forEach((f) => console.error(f));
    console.error(
      "\nThese would cause `TypeError: undefined is not an object (evaluating 't.NAME')` at runtime.",
    );
    process.exit(1);
  }
  console.log(`\n✓ All ${expectations.length} named lazy exports verified.`);
}

main();
