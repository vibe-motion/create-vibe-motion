import { ensureSharedBrowserExecutable, runLocalRemotionCli } from "./remotion-browser-executable.mjs";

const run = async () => {
  const cliArgs = process.argv.slice(2);
  if (cliArgs.length === 0) {
    console.error("[Remotion] missing command. Example: node scripts/remotion-cli.mjs render");
    process.exit(1);
  }

  const browserExecutable = await ensureSharedBrowserExecutable({
    logPrefix: "[Remotion][Browser]",
  });

  const remotionArgs = [...cliArgs];
  if (browserExecutable && !cliArgs.includes("--browser-executable")) {
    remotionArgs.push("--browser-executable", browserExecutable);
  }

  const env = browserExecutable
    ? { ...process.env, REMOTION_BROWSER_EXECUTABLE: browserExecutable }
    : process.env;

  const commandForLog = ["remotion", ...remotionArgs].join(" ");
  console.log(`[Remotion] running ${commandForLog}`);

  const result = runLocalRemotionCli({
    args: remotionArgs,
    stdio: "inherit",
    env,
  });

  if (result.error) {
    console.error(`[Remotion] failed to execute CLI: ${result.error.message}`);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Remotion] ${message}`);
  process.exit(1);
});
