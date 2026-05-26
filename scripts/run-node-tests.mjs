import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const testRoot = join(process.cwd(), "node_modules", ".tmp", "test-dist", "src");

function collectFiles(directory, predicate) {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...collectFiles(path, predicate));
      continue;
    }

    if (predicate(entry)) {
      files.push(path);
    }
  }

  return files;
}

function normalizeSpecifier(specifier) {
  if (specifier.startsWith(".") && !specifier.endsWith(".js")) {
    return `${specifier}.js`;
  }

  if (specifier.startsWith("ol/") && !specifier.endsWith(".js")) {
    return `${specifier}.js`;
  }

  return specifier;
}

function normalizeCompiledImports(file) {
  const source = readFileSync(file, "utf8");
  const nextSource = source
    .replace(
      /(from\s+["'])([^"']+)(["'])/g,
      (_match, prefix, specifier, suffix) =>
        `${prefix}${normalizeSpecifier(specifier)}${suffix}`,
    )
    .replace(
      /(import\s*\(\s*["'])([^"']+)(["']\s*\))/g,
      (_match, prefix, specifier, suffix) =>
        `${prefix}${normalizeSpecifier(specifier)}${suffix}`,
    );

  if (nextSource !== source) {
    writeFileSync(file, nextSource);
  }
}

const jsFiles = collectFiles(testRoot, (entry) => entry.endsWith(".js"));
jsFiles.forEach(normalizeCompiledImports);

const testFiles = jsFiles.filter((file) => file.endsWith(".test.js"));

if (testFiles.length === 0) {
  console.error(`No test files found in ${testRoot}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
