import {
  DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
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
  controlPanelTitle: "Template Parameters",
  controlPanelDescription:
    "videoWidth/videoHeight are video layout params. The rest belong to the default demoMotion scene and should be replaced when you swap to a new animation.",
  paramFields: DEMO_MOTION_PARAM_FIELDS,
  defaultProps: DEFAULT_DEMO_MOTION_PLUGIN_PARAMS,
  SceneComponent: DemoMotionScene,
  normalizeParamValue: ({ key, rawValue, currentValue }) =>
    normalizeDemoMotionParamValue({ key, rawValue, currentValue }),
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
