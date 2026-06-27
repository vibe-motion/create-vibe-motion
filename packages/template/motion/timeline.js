import { DEFAULT_MOTION_PROPS } from "./config.js";

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

export const resolveMotionSceneContext = (pluginParams = {}) => {
  const videoWidth = toInt(
    pluginParams.videoWidth,
    DEFAULT_MOTION_PROPS.videoWidth,
    480,
    1280
  );
  const videoHeight = toInt(
    pluginParams.videoHeight,
    DEFAULT_MOTION_PROPS.videoHeight,
    480,
    1440
  );

  return {
    title: toText(pluginParams.title, DEFAULT_MOTION_PROPS.title),
    subtitle: toText(pluginParams.subtitle, DEFAULT_MOTION_PROPS.subtitle),
    badgeText: toText(pluginParams.badgeText, DEFAULT_MOTION_PROPS.badgeText),
    cardDarkMode: toBoolean(
      pluginParams.cardDarkMode,
      DEFAULT_MOTION_PROPS.cardDarkMode
    ),
    speed: clamp(toNumber(pluginParams.speed, DEFAULT_MOTION_PROPS.speed), 0, 1),
    cardTiltMax: clamp(
      toNumber(pluginParams.cardTiltMax, DEFAULT_MOTION_PROPS.cardTiltMax),
      -30,
      30
    ),
    durationSeconds: clamp(
      toNumber(
        pluginParams.durationSeconds,
        DEFAULT_MOTION_PROPS.durationSeconds
      ),
      1,
      30
    ),
    layout: {
      videoWidth,
      videoHeight,
    },
  };
};

export const getMotionDurationInFrames = ({ fps, sceneContext, pluginParams } = {}) => {
  const resolvedContext = sceneContext ?? resolveMotionSceneContext(pluginParams ?? {});
  const resolvedFps = toPositiveFrames(fps, 30);
  return toPositiveFrames(resolvedContext.durationSeconds * resolvedFps, resolvedFps);
};

export const buildMotionSceneProps = ({
  frame = 0,
  fps,
  loop = false,
  sceneContext,
  pluginParams,
} = {}) => {
  const resolvedContext = sceneContext ?? resolveMotionSceneContext(pluginParams ?? {});
  const durationInFrames = getMotionDurationInFrames({
    fps,
    sceneContext: resolvedContext,
  });

  const rawFrame = toFrame(frame, 0);
  const boundedFrame = loop
    ? rawFrame % durationInFrames
    : Math.min(rawFrame, durationInFrames - 1);
  const progress = durationInFrames <= 1 ? 0 : boundedFrame / (durationInFrames - 1);
  const theta = progress * Math.PI * 2 * resolvedContext.speed;

  const cardRotateDeg = Math.sin(theta * 0.8) * resolvedContext.cardTiltMax;
  const chipOffset = Math.sin(theta * 1.6) * 24;

  return {
    ...resolvedContext,
    durationInFrames,
    frame: boundedFrame,
    progress,
    cardRotateDeg,
    chipOffset,
  };
};
