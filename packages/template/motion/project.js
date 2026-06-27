import { motionPlugin } from "./plugin.js";

export const ACTIVE_COMPOSITION = Object.freeze({
  id: "Motion30fps",
  fps: 30,
  plugin: motionPlugin,
});

export const ACTIVE_COMPOSITION_ID = ACTIVE_COMPOSITION.id;
