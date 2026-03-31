import { spawn } from "node:child_process";

const detectPackageManager = () => {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  return "npm";
};

const pm = detectPackageManager();
const pmCommand = process.platform === "win32" ? `${pm}.cmd` : pm;

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
  const child = spawn(pmCommand, task.args, {
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", (error) => {
    console.error(`[dev-workbench] ${task.name} failed to start: ${error.message}`);
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
