import { spawnSync } from "node:child_process";
import { accessSync, chmodSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

const LOCK_TIMEOUT_MS = 1_800_000;
const LOCK_RETRY_MS = 500;
const CACHE_VENDOR_DIR = "com.zjucat.create-vive-motion";
const CACHE_ROOT = resolve(homedir(), "Library", "Caches", CACHE_VENDOR_DIR, "remotion");
const CACHE_BROWSER_ROOT = resolve(CACHE_ROOT, "chrome-headless-shell");
const LOCK_DIR = resolve(CACHE_BROWSER_ROOT, ".install.lock");
const DEFAULT_LOG_PREFIX = "[create-vibe-motion][browser]";

const sleep = (durationMs) =>
  new Promise((resolvePromise) => {
    setTimeout(resolvePromise, durationMs);
  });

const getPlatformTag = () => {
  if (process.platform === "darwin" && process.arch === "arm64") {
    return "mac-arm64";
  }

  if (process.platform === "darwin" && process.arch === "x64") {
    return "mac-x64";
  }

  if (process.platform === "linux" && process.arch === "x64") {
    return "linux64";
  }

  if (process.platform === "linux" && process.arch === "arm64") {
    return "linux-arm64";
  }

  if (process.platform === "win32" && process.arch === "x64") {
    return "win64";
  }

  return null;
};

const getExecutableName = (platformTag) =>
  platformTag === "win64" ? "chrome-headless-shell.exe" : "chrome-headless-shell";

const isExecutableFile = (filePath) => {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const resolveRemotionVersion = () => {
  const remotionPackagePath = resolve(process.cwd(), "node_modules", "remotion", "package.json");
  if (!existsSync(remotionPackagePath)) {
    throw new Error(
      `[create-vibe-motion] missing remotion dependency at ${remotionPackagePath}. Run npm install before running Remotion commands.`
    );
  }

  const parsed = JSON.parse(readFileSync(remotionPackagePath, "utf8"));
  const version = typeof parsed.version === "string" ? parsed.version.trim() : "";
  if (version.length === 0) {
    throw new Error(`[create-vibe-motion] invalid remotion version in ${remotionPackagePath}.`);
  }

  return version;
};

const getVersionedInstallPaths = ({ remotionVersion, platformTag }) => {
  const browserDirectoryName = `chrome-headless-shell-${platformTag}`;
  const destinationBrowserDirectory = resolve(
    CACHE_BROWSER_ROOT,
    `remotion-${remotionVersion}`,
    platformTag,
    browserDirectoryName
  );

  return {
    destinationBrowserDirectory,
    destinationBinaryPath: resolve(
      destinationBrowserDirectory,
      getExecutableName(platformTag)
    ),
  };
};

const resolveLocalDownloadedBrowserDirectory = (platformTag) =>
  resolve(
    process.cwd(),
    "node_modules",
    ".remotion",
    "chrome-headless-shell",
    platformTag,
    `chrome-headless-shell-${platformTag}`
  );

const resolveRemotionCliEntryPath = () => {
  const remotionCliPackagePath = resolve(
    process.cwd(),
    "node_modules",
    "@remotion",
    "cli",
    "package.json"
  );
  if (!existsSync(remotionCliPackagePath)) {
    throw new Error(
      `[create-vibe-motion] missing @remotion/cli dependency at ${remotionCliPackagePath}. Run npm install before running Remotion commands.`
    );
  }

  const parsed = JSON.parse(readFileSync(remotionCliPackagePath, "utf8"));
  const binField = parsed.bin;
  const binRelativePath =
    typeof binField === "string"
      ? binField
      : typeof binField === "object" &&
          binField !== null &&
          typeof binField.remotion === "string"
        ? binField.remotion
        : "";

  if (binRelativePath.trim().length === 0) {
    throw new Error(
      `[create-vibe-motion] invalid @remotion/cli bin entry in ${remotionCliPackagePath}.`
    );
  }

  return resolve(dirname(remotionCliPackagePath), binRelativePath);
};

export const runLocalRemotionCli = ({ args, stdio = "inherit", env = process.env } = {}) => {
  if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) {
    throw new Error("[create-vibe-motion] runLocalRemotionCli expects string args.");
  }

  const remotionCliEntryPath = resolveRemotionCliEntryPath();
  return spawnSync(process.execPath, [remotionCliEntryPath, ...args], {
    stdio,
    env,
  });
};

const runRemotionBrowserEnsure = ({ log }) => {
  log("Cache miss. Running `remotion browser ensure` with local @remotion/cli.");
  const result = runLocalRemotionCli({
    args: ["browser", "ensure"],
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw new Error(`[create-vibe-motion] failed to execute Remotion browser ensure: ${result.error.message}`);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`[create-vibe-motion] Remotion browser ensure exited with status ${result.status}.`);
  }
};

const isPidRunning = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EPERM") {
      return true;
    }

    return false;
  }
};

const removeStaleLockIfNeeded = ({ log }) => {
  const lockInfoPath = resolve(LOCK_DIR, "lock-info.json");
  if (!existsSync(lockInfoPath)) {
    try {
      const lockAge = Date.now() - statSync(LOCK_DIR).mtimeMs;
      if (lockAge > 5_000) {
        rmSync(LOCK_DIR, { recursive: true, force: true });
        log("Removed stale install lock without metadata.");
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  try {
    const parsed = JSON.parse(readFileSync(lockInfoPath, "utf8"));
    const pid = Number(parsed.pid);
    const createdAt = Date.parse(parsed.createdAt);
    const lockAge = Number.isNaN(createdAt) ? 0 : Date.now() - createdAt;

    if (!isPidRunning(pid) || lockAge > LOCK_TIMEOUT_MS) {
      rmSync(LOCK_DIR, { recursive: true, force: true });
      log(`Removed stale install lock (pid=${Number.isFinite(pid) ? pid : "unknown"}).`);
      return true;
    }
  } catch {
    rmSync(LOCK_DIR, { recursive: true, force: true });
    log("Removed invalid install lock metadata.");
    return true;
  }

  return false;
};

const acquireInstallLock = async ({ log }) => {
  mkdirSync(CACHE_BROWSER_ROOT, { recursive: true });
  const startedAt = Date.now();
  let lastWaitLogAt = 0;

  while (true) {
    try {
      mkdirSync(LOCK_DIR);
      const lockInfoPath = resolve(LOCK_DIR, "lock-info.json");
      const lockInfo = {
        pid: process.pid,
        createdAt: new Date().toISOString(),
      };
      writeFileSync(lockInfoPath, `${JSON.stringify(lockInfo, null, 2)}\n`, "utf8");
      return;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") {
        throw error;
      }

      if (removeStaleLockIfNeeded({ log })) {
        continue;
      }

      if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
        throw new Error(`[create-vibe-motion] timeout waiting for browser install lock: ${LOCK_DIR}`);
      }

      if (Date.now() - lastWaitLogAt >= 5_000) {
        log("Another process is preparing the browser. Waiting for lock release...");
        lastWaitLogAt = Date.now();
      }
      await sleep(LOCK_RETRY_MS);
    }
  }
};

const releaseInstallLock = () => {
  rmSync(LOCK_DIR, { recursive: true, force: true });
};

const writeMetadataFile = ({ destinationBinaryPath, remotionVersion, platformTag }) => {
  const metadataPath = resolve(dirname(destinationBinaryPath), "metadata.json");
  const metadata = {
    remotionVersion,
    platform: platformTag,
    executable: destinationBinaryPath,
    installedAt: new Date().toISOString(),
  };
  writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
};

const installToSharedCache = ({
  destinationBinaryPath,
  destinationBrowserDirectory,
  localBrowserDirectory,
  remotionVersion,
  platformTag,
  log,
}) => {
  mkdirSync(dirname(destinationBrowserDirectory), { recursive: true });
  rmSync(destinationBrowserDirectory, { recursive: true, force: true });
  rmSync(
    resolve(dirname(destinationBrowserDirectory), getExecutableName(platformTag)),
    { force: true }
  );
  cpSync(localBrowserDirectory, destinationBrowserDirectory, {
    recursive: true,
    force: true,
  });
  if (platformTag !== "win64") {
    chmodSync(destinationBinaryPath, 0o755);
  }
  writeMetadataFile({ destinationBinaryPath, remotionVersion, platformTag });
  log(`Installed shared Chrome Headless Shell at: ${destinationBinaryPath}`);
};

export const ensureSharedBrowserExecutable = async ({ logPrefix = DEFAULT_LOG_PREFIX } = {}) => {
  const log = (message) => {
    console.log(`${logPrefix} ${message}`);
  };

  const platformTag = getPlatformTag();
  if (platformTag === null) {
    log(`Unsupported platform ${process.platform}/${process.arch}. Skipping browser pinning.`);
    return null;
  }

  if (process.platform === "darwin") {
    log(`Using user cache root: ${CACHE_ROOT}`);
  }

  if (existsSync(LOCK_DIR)) {
    removeStaleLockIfNeeded({ log });
  }

  const remotionVersion = resolveRemotionVersion();
  const { destinationBinaryPath, destinationBrowserDirectory } =
    getVersionedInstallPaths({ remotionVersion, platformTag });
  if (isExecutableFile(destinationBinaryPath)) {
    log(`Found shared Chrome Headless Shell for Remotion ${remotionVersion}.`);
    log(`browserExecutable=${destinationBinaryPath}`);
    return destinationBinaryPath;
  }

  await acquireInstallLock({ log });
  try {
    if (isExecutableFile(destinationBinaryPath)) {
      log(`Shared Chrome Headless Shell became available while waiting for lock.`);
      log(`browserExecutable=${destinationBinaryPath}`);
      return destinationBinaryPath;
    }

    runRemotionBrowserEnsure({ log });
    const localBrowserDirectory = resolveLocalDownloadedBrowserDirectory(platformTag);
    const localBinaryPath = resolve(
      localBrowserDirectory,
      getExecutableName(platformTag)
    );
    if (!isExecutableFile(localBinaryPath)) {
      throw new Error(
        `[create-vibe-motion] remotion browser ensure succeeded but no executable was found at ${localBinaryPath}.`
      );
    }

    installToSharedCache({
      destinationBinaryPath,
      destinationBrowserDirectory,
      localBrowserDirectory,
      remotionVersion,
      platformTag,
      log,
    });

    log(`browserExecutable=${destinationBinaryPath}`);
    return destinationBinaryPath;
  } finally {
    releaseInstallLock();
  }
};
