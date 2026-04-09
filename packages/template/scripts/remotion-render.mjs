import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACTIVE_COMPOSITION_ID } from "../shared/project/projectConfig.js";
import { ensureSharedBrowserExecutable, runLocalRemotionCli } from "./remotion-browser-executable.mjs";

const DEFAULT_CODEC = "prores";
const DEFAULT_PRORES_PROFILE = "4444";
const DEFAULT_PIXEL_FORMAT = "yuva444p10le";
const DEFAULT_IMAGE_FORMAT = "png";
const DEFAULT_SCALE = "2";
const DEFAULT_COMPOSITION_ID = ACTIVE_COMPOSITION_ID;

const compositionId = (
  process.env.REMOTION_COMPOSITION_ID || DEFAULT_COMPOSITION_ID
).trim();
const fps = (process.env.REMOTION_FPS || "").trim();
const outputPath = (
  process.env.REMOTION_OUTPUT || `out/${compositionId}-transparent.mov`
).trim();
const codec = (process.env.REMOTION_CODEC || DEFAULT_CODEC).trim();
const proresProfile = (
  process.env.REMOTION_PRORES_PROFILE || DEFAULT_PRORES_PROFILE
).trim();
const pixelFormat = (
  process.env.REMOTION_PIXEL_FORMAT || DEFAULT_PIXEL_FORMAT
).trim();
const imageFormat = (
  process.env.REMOTION_IMAGE_FORMAT || DEFAULT_IMAGE_FORMAT
).trim();
const scale = (process.env.REMOTION_SCALE || DEFAULT_SCALE).trim();
const propsJson = process.env.REMOTION_PROPS_JSON;
const propsFilePath = process.env.REMOTION_PROPS_FILE;

const resolvePropsJson = () => {
  if (typeof propsJson === "string" && propsJson.trim().length > 0) {
    return propsJson.trim();
  }

  if (typeof propsFilePath !== "string" || propsFilePath.trim().length === 0) {
    return "";
  }

  const absolutePropsFilePath = resolve(process.cwd(), propsFilePath.trim());
  const fileContent = readFileSync(absolutePropsFilePath, "utf8");
  const parsed = JSON.parse(fileContent);
  return JSON.stringify(parsed);
};

const run = async () => {
  const resolvedPropsJson = resolvePropsJson();
  const fpsForLog = fps.length > 0 ? fps : "composition-default";
  const browserExecutable = await ensureSharedBrowserExecutable({
    logPrefix: "[Remotion][Browser]",
  });

  const args = [
    "render",
    compositionId,
    outputPath,
    "--codec",
    codec,
    "--prores-profile",
    proresProfile,
    "--pixel-format",
    pixelFormat,
    "--image-format",
    imageFormat,
    "--scale",
    scale,
  ];

  if (fps.length > 0) {
    args.push("--fps", fps);
  }

  if (resolvedPropsJson.length > 0) {
    args.push("--props", resolvedPropsJson);
  }

  if (browserExecutable) {
    args.push("--browser-executable", browserExecutable);
  }

  const env = browserExecutable
    ? { ...process.env, REMOTION_BROWSER_EXECUTABLE: browserExecutable }
    : process.env;

  console.log(
    `[Remotion] render ${compositionId} -> ${outputPath} (fps=${fpsForLog}, codec=${codec})`
  );
  if (browserExecutable) {
    console.log(`[Remotion] browserExecutable=${browserExecutable}`);
  }

  const result = runLocalRemotionCli({
    args,
    stdio: "inherit",
    env,
  });

  if (result.error) {
    console.error(`[Remotion] failed to run render: ${result.error.message}`);
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
