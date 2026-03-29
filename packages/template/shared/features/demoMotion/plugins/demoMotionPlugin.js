import {
  DEFAULT_DEMO_MOTION_PROPS,
  DEMO_MOTION_PARAM_FIELDS,
  normalizeDemoMotionParamValue,
} from "../config/demoMotionDefaults.js";
import { DemoMotionScene } from "../scenes/DemoMotionScene.jsx";
import {
  buildDemoMotionSceneProps,
  getDemoMotionDurationInFrames,
  resolveDemoMotionSceneContext,
} from "../scenes/demoMotionSceneBuilder.js";

export const demoMotionPlugin = Object.freeze({
  id: "demo-motion",
  controlPanelTitle: "Scaffold Controls",
  paramFields: DEMO_MOTION_PARAM_FIELDS,
  defaultProps: DEFAULT_DEMO_MOTION_PROPS,
  SceneComponent: DemoMotionScene,
  normalizeParamValue: ({ key, rawValue, currentValue }) =>
    normalizeDemoMotionParamValue({ key, rawValue, currentValue }),
  resolveSceneContext: (pluginParams) =>
    resolveDemoMotionSceneContext({
      ...DEFAULT_DEMO_MOTION_PROPS,
      ...(pluginParams ?? {}),
    }),
  getDurationInFrames: ({ fps, sceneContext, pluginParams } = {}) => {
    const resolvedContext =
      sceneContext ??
      resolveDemoMotionSceneContext({
        ...DEFAULT_DEMO_MOTION_PROPS,
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
        ...DEFAULT_DEMO_MOTION_PROPS,
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
        ...DEFAULT_DEMO_MOTION_PROPS,
        ...(pluginParams ?? {}),
      });

    return resolvedContext.layout;
  },
});
