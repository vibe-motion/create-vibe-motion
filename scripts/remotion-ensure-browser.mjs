import { ensureSharedBrowserExecutable } from "./remotion-browser-executable.mjs";

const run = async () => {
  const browserExecutable = await ensureSharedBrowserExecutable({
    logPrefix: "[Remotion][Browser]",
  });

  if (browserExecutable) {
    console.log(`[Remotion] shared browser ready: ${browserExecutable}`);
  } else {
    console.log("[Remotion] shared browser pinning skipped for this platform.");
  }
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Remotion] ${message}`);
  process.exit(1);
});
