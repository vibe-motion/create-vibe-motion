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
const DEFAULT_REGISTRY = "https://registry.npmmirror.com";

const args = process.argv.slice(2);

let registryFromArg = null;
const positional = [];
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === "--registry") {
    const nextValue = args[index + 1];
    if (!nextValue || nextValue.startsWith("-")) {
      throw new Error("[create-vibe-motion] missing value for --registry.");
    }
    registryFromArg = nextValue;
    index += 1;
    continue;
  }

  if (arg.startsWith("--registry=")) {
    const value = arg.slice("--registry=".length);
    if (value.trim().length === 0) {
      throw new Error("[create-vibe-motion] missing value for --registry.");
    }
    registryFromArg = value;
    continue;
  }

  if (arg.startsWith("-")) {
    continue;
  }

  positional.push(arg);
}

const force = args.includes("--force") || args.includes("-f");
const skipInstall = args.includes("--skip-install");
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

const resolveRequiredPnpmSpec = () => {
  try {
    const template = JSON.parse(readFileSync(TEMPLATE_PACKAGE_PATH, "utf8"));
    const packageManager = typeof template.packageManager === "string" ? template.packageManager.trim() : "";
    if (packageManager.startsWith("pnpm@")) {
      return packageManager;
    }
  } catch {
    // fall through
  }

  return "pnpm";
};

const normalizeRegistry = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
};

const resolveRegistry = () =>
  normalizeRegistry(registryFromArg) ??
  normalizeRegistry(process.env.CREATE_VIBE_MOTION_REGISTRY) ??
  normalizeRegistry(process.env.npm_config_registry) ??
  normalizeRegistry(process.env.NPM_CONFIG_REGISTRY) ??
  DEFAULT_REGISTRY;

const buildInstallEnv = (registry) => ({
  ...process.env,
  npm_config_registry: registry,
  NPM_CONFIG_REGISTRY: registry,
});

const getCommandCandidates = (pm) => {
  if (process.platform !== "win32") {
    return [pm];
  }

  return [`${pm}.cmd`, `${pm}.exe`, pm];
};

const parsePreferredPm = () => {
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (userAgent.startsWith("pnpm/")) {
    return "pnpm";
  }
  if (userAgent.startsWith("npm/")) {
    return "npm";
  }
  return null;
};

const getPmPriority = () => {
  const preferredPm = parsePreferredPm();
  if (!preferredPm) {
    return ["pnpm", "npm"];
  }

  return [preferredPm, ...["pnpm", "npm"].filter((pm) => pm !== preferredPm)];
};

const resolveBundledNpmCliPath = () => {
  const nodeDir = dirname(process.execPath);
  const candidates = [
    resolve(nodeDir, "node_modules", "npm", "bin", "npm-cli.js"),
    resolve(nodeDir, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const buildInstallerCandidates = () => {
  const candidates = [];
  const dedupe = new Set();

  const pushCandidate = (candidate) => {
    const key = JSON.stringify(candidate);
    if (dedupe.has(key)) {
      return;
    }
    dedupe.add(key);
    candidates.push(candidate);
  };

  for (const pm of getPmPriority()) {
    for (const cmd of getCommandCandidates(pm)) {
      pushCandidate({
        pm,
        cmd,
        checkArgs: ["--version"],
        installArgs: ["install"],
      });
    }
  }

  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    pushCandidate({
      pm: parsePreferredPm() ?? "npm",
      cmd: process.execPath,
      checkArgs: [npmExecPath, "--version"],
      installArgs: [npmExecPath, "install"],
    });
  }

  const bundledNpmCliPath = resolveBundledNpmCliPath();
  if (bundledNpmCliPath) {
    pushCandidate({
      pm: "npm",
      cmd: process.execPath,
      checkArgs: [bundledNpmCliPath, "--version"],
      installArgs: [bundledNpmCliPath, "install"],
    });
  }

  return candidates;
};

const isInstallerAvailable = (candidate) => {
  const check = spawnSync(candidate.cmd, candidate.checkArgs, {
    stdio: "ignore",
  });
  return !check.error && check.status === 0;
};

const detectInstallerByPm = (pm) => {
  for (const candidate of buildInstallerCandidates()) {
    if (candidate.pm !== pm) {
      continue;
    }
    if (isInstallerAvailable(candidate)) {
      return candidate;
    }
  }

  return null;
};

const buildNpmGlobalInstallArgs = (npmInstaller, packageSpec, registry) => {
  const prefixArgs = npmInstaller.installArgs.slice(0, -1);
  return [...prefixArgs, "install", "--global", packageSpec, "--registry", registry];
};

const bootstrapPnpmWithNpm = (registry) => {
  const npmInstaller = detectInstallerByPm("npm");
  if (!npmInstaller) {
    return null;
  }

  const pnpmSpec = resolveRequiredPnpmSpec();
  console.log(`\nDetected npm but pnpm is missing. Installing ${pnpmSpec} globally...`);

  const bootstrapResult = spawnSync(
    npmInstaller.cmd,
    buildNpmGlobalInstallArgs(npmInstaller, pnpmSpec, registry),
    {
      stdio: "inherit",
      env: buildInstallEnv(registry),
    }
  );

  if (bootstrapResult.error || (typeof bootstrapResult.status === "number" && bootstrapResult.status !== 0)) {
    console.error(`\nFailed to install ${pnpmSpec}. Run \`npm install -g ${pnpmSpec}\` and retry.`);
    return null;
  }

  const pnpmInstaller = detectInstallerByPm("pnpm");
  if (!pnpmInstaller) {
    console.error(`\nInstalled ${pnpmSpec}, but pnpm is still not available in PATH.`);
    return null;
  }

  return pnpmInstaller;
};

const formatInstallCommand = (pm, registry) => {
  const baseCommand = pm === "npm" ? "npm install" : `${pm} install`;
  return `${baseCommand} --registry=${registry}`;
};
const formatDevCommand = (pm) => (pm === "npm" ? "npm run dev" : `${pm} dev`);

const runInstall = () => {
  const registry = resolveRegistry();
  console.log(`\nUsing registry: ${registry}`);

  let pnpmInstaller = detectInstallerByPm("pnpm");

  if (!pnpmInstaller) {
    pnpmInstaller = bootstrapPnpmWithNpm(registry);
  }

  if (!pnpmInstaller) {
    console.log("\nCould not find pnpm or install it via npm. Please install pnpm and run `pnpm install` manually.");
    return null;
  }

  const { cmd, installArgs } = pnpmInstaller;
  console.log("\nInstalling dependencies with pnpm...");
  const result = spawnSync(cmd, [...installArgs, "--registry", registry], {
    cwd: targetDir,
    stdio: "inherit",
    env: buildInstallEnv(registry),
  });

  if (result.error || (typeof result.status === "number" && result.status !== 0)) {
    console.error("\nInstall failed. Run `pnpm install` manually in the project directory.");
    return null;
  }

  return "pnpm";
};

const run = () => {
  const registry = resolveRegistry();
  ensureTargetDir();

  const entries = readManifest();
  for (const entry of entries) {
    copyEntry(entry);
  }

  writePackageJson();
  writeGitignore();

  const displayPath = relative(process.cwd(), targetDir) || ".";
  console.log(`\nScaffold created at ${displayPath}`);

  let installedWith = null;
  if (!skipInstall) {
    installedWith = runInstall();
  }

  const suggestedPm = installedWith ?? "pnpm";
  console.log("\nNext steps:");
  if (targetArg !== ".") {
    console.log(`  cd ${displayPath}`);
  }
  if (skipInstall) {
    console.log(`  ${formatInstallCommand(suggestedPm, registry)}`);
  }
  console.log(`  ${formatDevCommand(suggestedPm)}`);
};

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
