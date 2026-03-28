const normalizeId = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const normalizePositiveInt = (value, fallback) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
};

const assertUniqueId = ({ registry, id, itemName }) => {
  if (registry[id]) {
    throw new Error(`[scaffold] duplicate ${itemName} id: "${id}"`);
  }
};

export const mapPluginsById = (plugins = []) => {
  const pluginList = Array.isArray(plugins) ? plugins : [];
  const registry = {};

  for (const plugin of pluginList) {
    const id = normalizeId(plugin?.id);
    if (id.length === 0) {
      throw new Error('[scaffold] plugin is missing required "id"');
    }
    assertUniqueId({ registry, id, itemName: "plugin" });
    registry[id] = plugin;
  }

  return Object.freeze(registry);
};

export const mapCompositionsById = (compositions = []) => {
  const compositionList = Array.isArray(compositions) ? compositions : [];
  const registry = {};

  for (const composition of compositionList) {
    const id = normalizeId(composition?.id);
    if (id.length === 0) {
      throw new Error('[scaffold] composition is missing required "id"');
    }
    assertUniqueId({ registry, id, itemName: "composition" });

    const pluginId = normalizeId(composition?.pluginId);
    if (pluginId.length === 0) {
      throw new Error(`[scaffold] composition "${id}" is missing "pluginId"`);
    }

    registry[id] = Object.freeze({
      id,
      fps: normalizePositiveInt(composition?.fps, 30),
      pluginId,
    });
  }

  return Object.freeze(registry);
};

export const resolveActiveProjectBinding = ({
  pluginsById = {},
  compositionsById = {},
  activeCompositionId = "",
} = {}) => {
  const resolvedCompositionId = normalizeId(activeCompositionId);
  if (resolvedCompositionId.length === 0) {
    throw new Error("[scaffold] activeCompositionId is required");
  }

  const composition = compositionsById[resolvedCompositionId];
  if (!composition) {
    throw new Error(
      `[scaffold] active composition "${resolvedCompositionId}" is not defined`
    );
  }

  const plugin = pluginsById[composition.pluginId];
  if (!plugin) {
    throw new Error(
      `[scaffold] plugin "${composition.pluginId}" required by composition "${resolvedCompositionId}" is not defined`
    );
  }

  return Object.freeze({
    composition,
    plugin,
  });
};
