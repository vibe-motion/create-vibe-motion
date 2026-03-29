const mergeDefinedValues = (base, patch = {}) => ({
  ...base,
  ...Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ),
});

export const resolvePluginParams = (plugin, rawPluginParams = {}) =>
  mergeDefinedValues(plugin?.defaultProps ?? {}, rawPluginParams ?? {});

export const resolvePluginSceneContext = ({ plugin, pluginParams } = {}) =>
  plugin?.resolveSceneContext ? plugin.resolveSceneContext(pluginParams ?? {}) : {};

export const resolvePluginDurationInFrames = ({
  plugin,
  fps,
  sceneContext,
  pluginParams,
} = {}) => {
  if (!plugin?.getDurationInFrames) {
    return 1;
  }

  return plugin.getDurationInFrames({
    fps,
    sceneContext,
    pluginParams,
  });
};

export const resolvePluginSceneProps = ({
  plugin,
  frame,
  fps,
  loop,
  sceneContext,
  pluginParams,
} = {}) => {
  if (!plugin?.buildSceneProps) {
    return {};
  }

  return plugin.buildSceneProps({
    frame,
    fps,
    loop,
    sceneContext,
    pluginParams,
  });
};

export const resolvePluginLayout = ({
  plugin,
  sceneContext,
  sceneProps,
  pluginParams,
} = {}) => {
  if (!plugin?.getLayout) {
    return {
      videoWidth: 1,
      videoHeight: 1,
    };
  }

  return plugin.getLayout({
    sceneContext,
    sceneProps,
    pluginParams,
  });
};

export const resolvePluginComponent = (plugin) => plugin?.SceneComponent ?? null;

export const normalizePositiveInt = (value, fallback) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.round(value));
};
