/* eslint-env node */
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

const remotionEntryPoint = process.env.REMOTION_ENTRY_POINT || "./remotion/index.jsx";
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;

Config.setEntryPoint(remotionEntryPoint);
if (typeof browserExecutable === "string" && browserExecutable.trim().length > 0) {
  Config.setBrowserExecutable(browserExecutable.trim());
}
Config.overrideWebpackConfig((currentConfiguration) =>
  enableTailwind(currentConfiguration)
);
