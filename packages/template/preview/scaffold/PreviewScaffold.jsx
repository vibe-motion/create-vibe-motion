import { useMemo } from "react";
import {
  resolvePluginComponent,
  resolvePluginLayout,
  resolvePluginParams,
  resolvePluginSceneContext,
  resolvePluginSceneProps,
} from "../../shared/scaffold/pluginRuntime.js";
import { PreviewShell } from "./PreviewShell.jsx";

export const PreviewScaffold = ({
  plugin,
  fps = 30,
}) => {
  const pluginParams = useMemo(() => resolvePluginParams(plugin), [plugin]);

  const sceneContext = useMemo(
    () =>
      resolvePluginSceneContext({
        plugin,
        pluginParams,
      }),
    [plugin, pluginParams]
  );

  const sceneProps = useMemo(
    () =>
      resolvePluginSceneProps({
        plugin,
        frame: 0,
        fps,
        loop: false,
        sceneContext,
        pluginParams,
      }),
    [fps, plugin, pluginParams, sceneContext]
  );

  const layout = resolvePluginLayout({
    plugin,
    sceneContext,
    sceneProps,
    pluginParams,
  });
  const SceneComponent = resolvePluginComponent(plugin);

  const videoWidth = Math.max(1, Math.round(layout?.videoWidth ?? 1));
  const videoHeight = Math.max(1, Math.round(layout?.videoHeight ?? 1));

  return (
    <PreviewShell
      videoWidth={videoWidth}
      videoHeight={videoHeight}
    >
      {plugin.renderScene
        ? plugin.renderScene({
            sceneProps,
            sceneContext,
            pluginParams,
          })
        : SceneComponent
          ? <SceneComponent {...sceneProps} />
          : null}
    </PreviewShell>
  );
};
