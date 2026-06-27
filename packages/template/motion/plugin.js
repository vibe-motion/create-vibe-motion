import { DEFAULT_MOTION_PROPS } from "./config.js";
import { MotionScene } from "./Scene.jsx";
import {
  buildMotionSceneProps,
  getMotionDurationInFrames,
  resolveMotionSceneContext,
} from "./timeline.js";

export const motionPlugin = Object.freeze({
  id: "motion",
  defaultProps: DEFAULT_MOTION_PROPS,
  SceneComponent: MotionScene,
  resolveSceneContext: (pluginParams) =>
    resolveMotionSceneContext({
      ...DEFAULT_MOTION_PROPS,
      ...(pluginParams ?? {}),
    }),
  getDurationInFrames: ({ fps, sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveMotionSceneContext({
        ...DEFAULT_MOTION_PROPS,
        ...(pluginParams ?? {}),
      });

    return getMotionDurationInFrames({
      fps,
      sceneContext: resolvedContext,
    });
  },
  buildSceneProps: ({ frame, fps, loop, sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveMotionSceneContext({
        ...DEFAULT_MOTION_PROPS,
        ...(pluginParams ?? {}),
      });

    return buildMotionSceneProps({
      frame,
      fps,
      loop,
      sceneContext: resolvedContext,
    });
  },
  getLayout: ({ sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveMotionSceneContext({
        ...DEFAULT_MOTION_PROPS,
        ...(pluginParams ?? {}),
      });

    return resolvedContext.layout;
  },
});
