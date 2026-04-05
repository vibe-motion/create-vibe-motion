import { DEFAULT_DEMO_MOTION_PROPS } from "../config/demoMotionDefaults.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
};

const toInt = (value, fallback, min, max) =>
  Math.round(clamp(toNumber(value, fallback), min, max));

const toPositiveFrames = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.round(parsed));
};

const toFrame = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.floor(parsed));
};

const toText = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const resolved = value.trim();
  return resolved.length > 0 ? resolved : fallback;
};

const toBoolean = (value, fallback) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on", "dark"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off", "light"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

export const resolveDemoMotionSceneContext = (pluginParams = {}) => {
  const videoWidth = toInt(pluginParams.videoWidth, DEFAULT_DEMO_MOTION_PROPS.videoWidth, 480, 1280);
  const videoHeight = toInt(
    pluginParams.videoHeight,
    DEFAULT_DEMO_MOTION_PROPS.videoHeight,
    480,
    1280
  );

  return {
    title: toText(pluginParams.title, DEFAULT_DEMO_MOTION_PROPS.title),
    subtitle: toText(pluginParams.subtitle, DEFAULT_DEMO_MOTION_PROPS.subtitle),
    badgeText: toText(pluginParams.badgeText, DEFAULT_DEMO_MOTION_PROPS.badgeText),
    cardDarkMode: toBoolean(
      pluginParams.cardDarkMode,
      DEFAULT_DEMO_MOTION_PROPS.cardDarkMode
    ),
    speed: clamp(toNumber(pluginParams.speed, DEFAULT_DEMO_MOTION_PROPS.speed), 0, 1),
    orbitRadius: toInt(
      pluginParams.orbitRadius,
      DEFAULT_DEMO_MOTION_PROPS.orbitRadius,
      20,
      480
    ),
    accentHue: toInt(pluginParams.accentHue, DEFAULT_DEMO_MOTION_PROPS.accentHue, 0, 360),
    backgroundHue: toInt(
      pluginParams.backgroundHue,
      DEFAULT_DEMO_MOTION_PROPS.backgroundHue,
      0,
      360
    ),
    cardTiltMax: clamp(
      toNumber(pluginParams.cardTiltMax, DEFAULT_DEMO_MOTION_PROPS.cardTiltMax),
      -30,
      30
    ),
    durationSeconds: clamp(
      toNumber(pluginParams.durationSeconds, DEFAULT_DEMO_MOTION_PROPS.durationSeconds),
      1,
      30
    ),
    layout: {
      videoWidth,
      videoHeight,
    },
  };
};

export const getDemoMotionDurationInFrames = ({ fps, sceneContext, pluginParams } = {}) => {
  const resolvedContext = sceneContext ?? resolveDemoMotionSceneContext(pluginParams ?? {});
  const resolvedFps = toPositiveFrames(fps, 30);
  return toPositiveFrames(resolvedContext.durationSeconds * resolvedFps, resolvedFps);
};

export const buildDemoMotionSceneProps = ({
  frame = 0,
  fps,
  loop = false,
  sceneContext,
  pluginParams,
} = {}) => {
  const resolvedContext = sceneContext ?? resolveDemoMotionSceneContext(pluginParams ?? {});
  const durationInFrames = getDemoMotionDurationInFrames({
    fps,
    sceneContext: resolvedContext,
  });

  const rawFrame = toFrame(frame, 0);
  const boundedFrame = loop
    ? rawFrame % durationInFrames
    : Math.min(rawFrame, durationInFrames - 1);
  const progress = durationInFrames <= 1 ? 0 : boundedFrame / (durationInFrames - 1);
  const theta = progress * Math.PI * 2 * resolvedContext.speed;

  const orbitX = Math.cos(theta) * resolvedContext.orbitRadius;
  const orbitY = Math.sin(theta * 1.25) * resolvedContext.orbitRadius * 0.55;
  const pulseScale = 0.92 + (Math.sin(theta * 2.2) + 1) * 0.05;
  const cardRotateDeg = Math.sin(theta * 0.8) * resolvedContext.cardTiltMax;
  const chipOffset = Math.sin(theta * 1.6) * 24;

  return {
    ...resolvedContext,
    durationInFrames,
    frame: boundedFrame,
    progress,
    orbitX,
    orbitY,
    pulseScale,
    cardRotateDeg,
    chipOffset,
  };
};
