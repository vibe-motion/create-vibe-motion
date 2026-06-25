import { DEFAULT_DEMO_MOTION_PLUGIN_PARAMS } from "../config/demoMotionDefaults.js";
import { DemoMotionScene } from "../scenes/DemoMotionScene.jsx";
import {
  buildDemoMotionSceneProps,
  getDemoMotionDurationInFrames,
  resolveDemoMotionSceneContext,
} from "../scenes/demoMotionSceneBuilder.js";

export const demoMotionPlugin = Object.freeze({
  id: "demo-motion",
  defaultProps: DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
  SceneComponent: DemoMotionScene,
  resolveSceneContext: (pluginParams) =>
    resolveDemoMotionSceneContext({
      ...DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
      ...(pluginParams ?? {}),
    }),
  getDurationInFrames: ({ fps, sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveDemoMotionSceneContext({
        ...DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
        ...(pluginParams ?? {}),
      });

    return getDemoMotionDurationInFrames({
      fps,
      sceneContext: resolvedContext,
    });
  },
  buildSceneProps: ({ frame, fps, loop, sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveDemoMotionSceneContext({
        ...DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
        ...(pluginParams ?? {}),
      });

    return buildDemoMotionSceneProps({
      frame,
      fps,
      loop,
      sceneContext: resolvedContext,
    });
  },
  getLayout: ({ sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveDemoMotionSceneContext({
        ...DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
        ...(pluginParams ?? {}),
      });

    return resolvedContext.layout;
  },
});
