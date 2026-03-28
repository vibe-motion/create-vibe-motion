import { demoMotionPlugin } from "../features/demoMotion/plugins/demoMotionPlugin.js";
import { mapCompositionsById, mapPluginsById } from "../scaffold/projectBindingRuntime.js";

export const PROJECT_PLUGINS = Object.freeze([demoMotionPlugin]);
export const PROJECT_PLUGINS_BY_ID = mapPluginsById(PROJECT_PLUGINS);

export const PROJECT_COMPOSITIONS = Object.freeze([
  {
    id: "ScaffoldDemo30fps",
    fps: 30,
    pluginId: demoMotionPlugin.id,
  },
]);
export const PROJECT_COMPOSITIONS_BY_ID = mapCompositionsById(PROJECT_COMPOSITIONS);
