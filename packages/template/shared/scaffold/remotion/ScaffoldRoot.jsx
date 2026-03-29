import React from "react";
import { Composition } from "remotion";
import { ScaffoldVideo } from "./ScaffoldVideo.jsx";
import {
  normalizePositiveInt,
  resolvePluginDurationInFrames,
  resolvePluginLayout,
  resolvePluginParams,
  resolvePluginSceneContext,
} from "../pluginRuntime.js";

const normalizeCompositionId = (value) => {
  if (typeof value !== "string") {
    return "Composition";
  }

  const resolved = value.trim();
  return resolved.length > 0 ? resolved : "Composition";
};

const bindVideoComponent = (plugin) => {
  const BoundVideoComponent = (props) => <ScaffoldVideo plugin={plugin} {...props} />;
  BoundVideoComponent.displayName = `ScaffoldVideo:${plugin?.id ?? "unknown"}`;
  return BoundVideoComponent;
};

export const ScaffoldRoot = ({ compositionId, fps, plugin }) => {
  if (!plugin) {
    throw new Error("[scaffold] active plugin is required for ScaffoldRoot");
  }

  const resolvedCompositionId = normalizeCompositionId(compositionId);
  const resolvedFps = normalizePositiveInt(fps, 30);
  const VideoComponent = bindVideoComponent(plugin);
  const defaultProps = resolvePluginParams(plugin);
  const defaultSceneContext = resolvePluginSceneContext({
    plugin,
    pluginParams: defaultProps,
  });
  const defaultLayout = resolvePluginLayout({
    plugin,
    sceneContext: defaultSceneContext,
    pluginParams: defaultProps,
  });

  return (
    <Composition
      id={resolvedCompositionId}
      component={VideoComponent}
      durationInFrames={resolvePluginDurationInFrames({
        plugin,
        fps: resolvedFps,
        sceneContext: defaultSceneContext,
        pluginParams: defaultProps,
      })}
      fps={resolvedFps}
      width={normalizePositiveInt(defaultLayout.videoWidth, 1)}
      height={normalizePositiveInt(defaultLayout.videoHeight, 1)}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const resolvedProps = resolvePluginParams(plugin, props);
        const pluginParams = resolvePluginParams(plugin, {
          ...resolvedProps,
          videoWidth: normalizePositiveInt(
            props?.videoWidth,
            defaultProps.videoWidth
          ),
          videoHeight: normalizePositiveInt(
            props?.videoHeight,
            defaultProps.videoHeight
          ),
        });
        const sceneContext = resolvePluginSceneContext({
          plugin,
          pluginParams,
        });
        const layout = resolvePluginLayout({
          plugin,
          sceneContext,
          pluginParams,
        });

        return {
          durationInFrames: resolvePluginDurationInFrames({
            plugin,
            fps: resolvedFps,
            sceneContext,
            pluginParams,
          }),
          width: normalizePositiveInt(layout.videoWidth, 1),
          height: normalizePositiveInt(layout.videoHeight, 1),
        };
      }}
    />
  );
};
