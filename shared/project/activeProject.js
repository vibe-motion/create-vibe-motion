import { resolveActiveProjectBinding } from "../scaffold/projectBindingRuntime.js";
import { ACTIVE_COMPOSITION_ID } from "./projectConfig.js";
import {
  PROJECT_COMPOSITIONS_BY_ID,
  PROJECT_PLUGINS_BY_ID,
} from "./projectRegistry.js";

export const ACTIVE_PROJECT_BINDING = resolveActiveProjectBinding({
  pluginsById: PROJECT_PLUGINS_BY_ID,
  compositionsById: PROJECT_COMPOSITIONS_BY_ID,
  activeCompositionId: ACTIVE_COMPOSITION_ID,
});

export const ACTIVE_PLUGIN = ACTIVE_PROJECT_BINDING.plugin;
export const ACTIVE_COMPOSITION = ACTIVE_PROJECT_BINDING.composition;
