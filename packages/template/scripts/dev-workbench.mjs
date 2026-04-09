import { spawn, spawnSync } from "node:child_process";

const detectPackageManager = () => {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  return "npm";
};

const dedupeCandidates = (candidates) => {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const key = `${candidate.cmd}::${candidate.prefixArgs.join("\u0000")}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(candidate);
  }
  return result;
};

const buildPackageManagerCandidates = () => {
  const pm = detectPackageManager();
  const candidates = [];
  const npmExecPath = (process.env.npm_execpath || "").trim();

  // Use npm_execpath whenever available. It points to the exact package manager
  // entry file that launched this script (pnpm/yarn/npm), avoiding Windows spawn edge cases.
  if (npmExecPath.length > 0) {
    candidates.push({
      cmd: process.execPath,
      prefixArgs: [npmExecPath],
      display: `${process.execPath} ${npmExecPath}`,
    });
  }

  if (process.platform === "win32") {
    candidates.push({ cmd: `${pm}.cmd`, prefixArgs: [], display: `${pm}.cmd` });
    candidates.push({ cmd: `${pm}.exe`, prefixArgs: [], display: `${pm}.exe` });
  }

  candidates.push({ cmd: pm, prefixArgs: [], display: pm });

  return dedupeCandidates(candidates);
};

const isPackageManagerAvailable = (candidate) => {
  const check = spawnSync(candidate.cmd, [...candidate.prefixArgs, "--version"], {
    stdio: "ignore",
    env: process.env,
  });
  return !check.error && check.status === 0;
};

const resolvePackageManagerRunner = () => {
  const candidates = buildPackageManagerCandidates();
  for (const candidate of candidates) {
    if (isPackageManagerAvailable(candidate)) {
      return candidate;
    }
  }

  // Return first candidate even if checks failed so downstream error message
  // still reflects the most likely command.
  return candidates[0];
};

const packageManagerRunner = resolvePackageManagerRunner();

const tasks = [
  { name: "preview", args: ["run", "preview:dev"] },
  { name: "studio", args: ["run", "remotion:studio"] },
];

const children = [];
const exitCodes = new Map();
let shuttingDown = false;

const stopAllChildren = (signal = "SIGTERM") => {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
};

const maybeExitProcess = () => {
  if (exitCodes.size < tasks.length) {
    return;
  }

  if (shuttingDown) {
    process.exit(0);
  }

  const firstFailure = [...exitCodes.values()].find((code) => code !== 0);
  process.exit(typeof firstFailure === "number" ? firstFailure : 0);
};

for (const task of tasks) {
  const child = spawn(packageManagerRunner.cmd, [...packageManagerRunner.prefixArgs, ...task.args], {
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });

  child.on("error", (error) => {
    console.error(
      `[dev-workbench] ${task.name} failed to start with ${packageManagerRunner.display}: ${error.message}`
    );
    if (!shuttingDown) {
      shuttingDown = true;
      stopAllChildren("SIGTERM");
    }
    exitCodes.set(task.name, 1);
    maybeExitProcess();
  });

  child.on("exit", (code, signal) => {
    const resolvedCode = typeof code === "number" ? code : signal ? 1 : 0;
    exitCodes.set(task.name, resolvedCode);

    if (!shuttingDown && resolvedCode !== 0) {
      shuttingDown = true;
      stopAllChildren("SIGTERM");
    }

    maybeExitProcess();
  });

  children.push(child);
}

const shutdown = (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  stopAllChildren(signal);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
