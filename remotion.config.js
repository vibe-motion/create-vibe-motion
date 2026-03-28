/* eslint-env node */
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

const remotionEntryPoint = process.env.REMOTION_ENTRY_POINT || "./remotion/index.jsx";

Config.setEntryPoint(remotionEntryPoint);
Config.overrideWebpackConfig((currentConfiguration) =>
  enableTailwind(currentConfiguration)
);
