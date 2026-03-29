#!/usr/bin/env node

import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(SCRIPT_DIR, "..", "template");
const MANIFEST_PATH = resolve(PACKAGE_ROOT, "scaffold-manifest.json");
const TEMPLATE_PACKAGE_PATH = resolve(PACKAGE_ROOT, "scaffold-template-package.json");
const TEMPLATE_GITIGNORE_PATH = resolve(PACKAGE_ROOT, "scaffold-template-gitignore");
const DEFAULT_TARGET_DIRNAME = "vibe-motion-app";

const args = process.argv.slice(2);
const force = args.includes("--force") || args.includes("-f");
const skipInstall = args.includes("--skip-install");
const positional = args.filter((arg) => !arg.startsWith("-"));
const targetArg = positional[0] ?? DEFAULT_TARGET_DIRNAME;
const targetDir = resolve(process.cwd(), targetArg);

const ensureTargetDir = () => {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    return;
  }

  if (!lstatSync(targetDir).isDirectory()) {
    throw new Error(`[create-vibe-motion] target exists and is not a directory: ${targetDir}`);
  }

  const files = readdirSync(targetDir);
  if (files.length > 0 && !force) {
    throw new Error(
      `[create-vibe-motion] target directory is not empty: ${targetDir}\n` +
        "Re-run with --force to overwrite existing files."
    );
  }
};

const copyEntry = (entryPath) => {
  const sourcePath = resolve(PACKAGE_ROOT, entryPath);
  const destinationPath = resolve(targetDir, entryPath);
  mkdirSync(dirname(destinationPath), { recursive: true });

  const stats = lstatSync(sourcePath);
  if (stats.isDirectory()) {
    cpSync(sourcePath, destinationPath, { recursive: true, force: true });
    return;
  }

  cpSync(sourcePath, destinationPath, { force: true });
};

const sanitizePackageName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-._~]/g, "-")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "") || "vibe-motion-app";

const writePackageJson = () => {
  const template = JSON.parse(readFileSync(TEMPLATE_PACKAGE_PATH, "utf8"));
  template.name = sanitizePackageName(basename(targetDir));
  writeFileSync(resolve(targetDir, "package.json"), `${JSON.stringify(template, null, 2)}\n`, "utf8");
};

const writeGitignore = () => {
  const content = readFileSync(TEMPLATE_GITIGNORE_PATH, "utf8");
  writeFileSync(resolve(targetDir, ".gitignore"), content, "utf8");
};

const readManifest = () => {
  const content = readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== "string")) {
    throw new Error("[create-vibe-motion] scaffold-manifest.json must be a string array.");
  }
  return parsed;
};

const detectInstaller = () => {
  for (const cmd of ["pnpm", "npm"]) {
    const check = spawnSync(cmd, ["--version"], { stdio: "ignore" });
    if (!check.error) return cmd;
  }
  return null;
};

const runInstall = () => {
  const pm = detectInstaller();
  if (!pm) {
    console.log("\nCould not find pnpm or npm. Please install dependencies manually.");
    return false;
  }

  console.log(`\nInstalling dependencies with ${pm}...`);
  const cmd = process.platform === "win32" ? `${pm}.cmd` : pm;
  const result = spawnSync(cmd, ["install"], {
    cwd: targetDir,
    stdio: "inherit",
  });

  if (result.error || (typeof result.status === "number" && result.status !== 0)) {
    console.error(`\nInstall failed. Run \`${pm} install\` manually in the project directory.`);
    return false;
  }

  return true;
};

const run = () => {
  ensureTargetDir();

  const entries = readManifest();
  for (const entry of entries) {
    copyEntry(entry);
  }

  writePackageJson();
  writeGitignore();

  const displayPath = relative(process.cwd(), targetDir) || ".";
  console.log(`\nScaffold created at ${displayPath}`);

  if (!skipInstall) {
    runInstall();
  }

  console.log("\nNext steps:");
  if (targetArg !== ".") {
    console.log(`  cd ${displayPath}`);
  }
  if (skipInstall) {
    console.log("  pnpm install");
  }
  console.log("  pnpm dev");
};

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
