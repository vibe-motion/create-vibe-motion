import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
} from "remotion";
import {
  resolvePluginComponent,
  resolvePluginParams,
  resolvePluginSceneContext,
  resolvePluginSceneProps,
} from "../pluginRuntime.js";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const ScaffoldVideo = ({ plugin, ...rawPluginParams }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const waitsForSceneLayoutReady = plugin?.waitForSceneLayoutReady === true;
  const [fontHandle] = useState(() => delayRender("Waiting for layout to settle"));
  const readinessRef = useRef({
    fontsReady: false,
    layoutReady: false,
    continued: false,
  });

  const markRenderReady = useCallback(
    (key) => {
      readinessRef.current[key] = true;
      if (
        readinessRef.current.fontsReady &&
        readinessRef.current.layoutReady &&
        !readinessRef.current.continued
      ) {
        readinessRef.current.continued = true;
        continueRender(fontHandle);
      }
    },
    [fontHandle]
  );

  const pluginParams = useMemo(
    () =>
      resolvePluginParams(plugin, {
        ...rawPluginParams,
        videoWidth: width,
        videoHeight: height,
      }),
    [height, plugin, rawPluginParams, width]
  );
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
        frame,
        fps,
        loop: false,
        sceneContext,
        pluginParams,
      }),
    [fps, frame, plugin, pluginParams, sceneContext]
  );
  const SceneComponent = resolvePluginComponent(plugin);

  const handleAutoLayoutReady = useCallback(
    () => markRenderReady("layoutReady"),
    [markRenderReady]
  );

  useEffect(() => {
    if (!plugin) {
      cancelRender(new Error("Active plugin is missing"));
      return undefined;
    }

    if (!SceneComponent) {
      cancelRender(new Error("Active plugin is missing SceneComponent"));
      return undefined;
    }

    return undefined;
  }, [SceneComponent, plugin]);

  useEffect(() => {
    if (waitsForSceneLayoutReady) {
      return undefined;
    }
    markRenderReady("layoutReady");
    return undefined;
  }, [markRenderReady, waitsForSceneLayoutReady]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts?.ready) {
      markRenderReady("fontsReady");
      return undefined;
    }

    let cancelled = false;

    document.fonts.ready
      .then(() => {
        if (cancelled) {
          return;
        }
        markRenderReady("fontsReady");
      })
      .catch((error) => {
        if (!cancelled) {
          cancelRender(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [markRenderReady]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", overflow: "hidden" }}>
      {SceneComponent ? (
        <SceneComponent {...sceneProps} onAutoLayoutReady={handleAutoLayoutReady} />
      ) : null}
    </AbsoluteFill>
  );
};
