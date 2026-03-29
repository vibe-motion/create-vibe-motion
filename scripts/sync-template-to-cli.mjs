#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const TEMPLATE_SRC = resolve(REPO_ROOT, "packages", "template");
const CLI_TEMPLATE_DEST = resolve(REPO_ROOT, "packages", "create-vibe-motion", "template");

const MANIFEST_PATH = resolve(TEMPLATE_SRC, "scaffold-manifest.json");

const EXTRA_FILES = [
  "scaffold-manifest.json",
  "scaffold-template-package.json",
  "scaffold-template-gitignore",
];

const readManifest = () => {
  const content = readFileSync(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed) || parsed.some((e) => typeof e !== "string")) {
    throw new Error("scaffold-manifest.json must be a string array.");
  }
  return parsed;
};

const run = () => {
  if (existsSync(CLI_TEMPLATE_DEST)) {
    rmSync(CLI_TEMPLATE_DEST, { recursive: true, force: true });
  }
  mkdirSync(CLI_TEMPLATE_DEST, { recursive: true });

  const entries = [...readManifest(), ...EXTRA_FILES];

  for (const entry of entries) {
    const src = resolve(TEMPLATE_SRC, entry);
    const dest = resolve(CLI_TEMPLATE_DEST, entry);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true, force: true });
  }

  console.log(`Synced ${entries.length} entries to ${CLI_TEMPLATE_DEST}`);
};

run();
