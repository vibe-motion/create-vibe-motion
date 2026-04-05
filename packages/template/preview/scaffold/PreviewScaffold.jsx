import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  resolvePluginComponent,
  resolvePluginDurationInFrames,
  resolvePluginLayout,
  resolvePluginParams,
  resolvePluginSceneContext,
  resolvePluginSceneProps,
} from "../../shared/scaffold/pluginRuntime.js";
import { PluginParamsPanel } from "./PluginParamsPanel.jsx";
import { PreviewShell } from "./PreviewShell.jsx";

const DEFAULT_MIN_STAGE_SCALE = 0.1;

const useViewport = () => {
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 1200, height: 800 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewport;
};

const useElementSize = (ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.round(rect.width)),
        height: Math.max(0, Math.round(rect.height)),
      });
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      if (typeof window !== "undefined") {
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
      }
      return undefined;
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

const useFrameClock = ({ fps, loopDurationFrames }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame((previousFrame) => {
      if (typeof loopDurationFrames === "number" && loopDurationFrames > 0) {
        return previousFrame % loopDurationFrames;
      }
      return previousFrame;
    });
  }, [loopDurationFrames]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let rafId = null;
    const startedAtMs = performance.now();

    const tick = (now) => {
      const elapsedMs = Math.max(0, now - startedAtMs);
      const rawFrame = Math.floor((elapsedMs / 1000) * fps);
      const nextFrame =
        typeof loopDurationFrames === "number" && loopDurationFrames > 0
          ? rawFrame % loopDurationFrames
          : rawFrame;
      setFrame((previousFrame) =>
        previousFrame === nextFrame ? previousFrame : nextFrame
      );
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [fps, loopDurationFrames]);

  return frame;
};

export const PreviewScaffold = ({
  plugin,
  fps = 30,
  loop = true,
  minStageScale = DEFAULT_MIN_STAGE_SCALE,
}) => {
  const viewport = useViewport();
  const previewViewportRef = useRef(null);
  const previewViewportSize = useElementSize(previewViewportRef);
  const [pluginParams, setPluginParams] = useState(() => resolvePluginParams(plugin));

  const sceneContext = useMemo(
    () =>
      resolvePluginSceneContext({
        plugin,
        pluginParams,
      }),
    [plugin, pluginParams]
  );

  const loopDurationFrames = useMemo(
    () =>
      resolvePluginDurationInFrames({
        plugin,
        fps,
        sceneContext,
        pluginParams,
      }),
    [fps, plugin, pluginParams, sceneContext]
  );

  const frame = useFrameClock({
    fps,
    loopDurationFrames,
  });

  const sceneProps = useMemo(
    () =>
      resolvePluginSceneProps({
        plugin,
        frame,
        fps,
        loop,
        sceneContext,
        pluginParams,
      }),
    [fps, frame, loop, plugin, pluginParams, sceneContext]
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

  const availableWidth =
    previewViewportSize.width > 0
      ? previewViewportSize.width
      : Math.max(320, viewport.width - 48);
  const availableHeight =
    previewViewportSize.height > 0
      ? previewViewportSize.height
      : Math.max(220, viewport.height - 360);

  const stageScale = useMemo(() => {
    const widthScale = availableWidth / videoWidth;
    const heightScale = availableHeight / videoHeight;
    return Math.max(minStageScale, Math.min(1, widthScale, heightScale));
  }, [availableHeight, availableWidth, minStageScale, videoHeight, videoWidth]);

  const stageDisplayWidth = Math.max(1, Math.round(videoWidth * stageScale));
  const stageDisplayHeight = Math.max(1, Math.round(videoHeight * stageScale));

  const updateParam = useCallback(
    (key, rawValue) => {
      setPluginParams((previousParams) => {
        const nextValue = plugin.normalizeParamValue
          ? plugin.normalizeParamValue({
              key,
              rawValue,
              currentValue: previousParams[key],
              pluginParams: previousParams,
            })
          : rawValue;

        return {
          ...previousParams,
          [key]: nextValue,
        };
      });
    },
    [plugin]
  );

  const controlPanel = useMemo(() => {
    if (plugin.paramFields) {
      return (
        <PluginParamsPanel
          title={plugin.controlPanelTitle}
          description={plugin.controlPanelDescription}
          fields={plugin.paramFields}
          pluginParams={pluginParams}
          onUpdateParam={updateParam}
        />
      );
    }

    if (plugin.renderControlPanel) {
      return plugin.renderControlPanel({
        pluginParams,
        onUpdateParam: updateParam,
      });
    }

    return null;
  }, [plugin, pluginParams, updateParam]);

  return (
    <PreviewShell
      controlPanel={controlPanel}
      previewViewportRef={previewViewportRef}
      stageDisplayWidth={stageDisplayWidth}
      stageDisplayHeight={stageDisplayHeight}
      stageScale={stageScale}
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
