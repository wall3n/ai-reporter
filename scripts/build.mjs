import { execFileSync } from "node:child_process";
import { existsSync, globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let esbuildBin = join(root, "node_modules", "@esbuild", "darwin-arm64", "bin", "esbuild");
if (!existsSync(esbuildBin)) {
  esbuildBin = "esbuild";
}

// 1. Bundle main CLI into a standalone ESM module (bundles commander, keeps node builtins external)
const banner = '#!/usr/bin/env node\nimport { createRequire as __createRequire } from "module"; const require = __createRequire(import.meta.url);';
execFileSync(
  esbuildBin,
  [
    "src/index.ts",
    "--bundle",
    "--platform=node",
    "--target=node22",
    "--format=esm",
    `--banner:js=${banner}`,
    "--outfile=dist/index.js",
  ],
  { cwd: root, stdio: "inherit" }
);

// 2. If --test or test files exist, bundle tests
if (process.argv.includes("--test") || process.env.BUILD_TESTS === "1") {
  const testFiles = globSync("test/*.test.ts", { cwd: root });
  execFileSync(
    esbuildBin,
    [
      ...testFiles,
      "--bundle",
      "--platform=node",
      "--target=node22",
      "--format=esm",
      "--packages=external",
      "--outdir=dist/test",
    ],
    { cwd: root, stdio: "inherit" }
  );
}
