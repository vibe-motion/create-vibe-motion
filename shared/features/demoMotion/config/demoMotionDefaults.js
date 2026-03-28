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

const toText = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const resolved = value.trim();
  return resolved.length > 0 ? resolved : fallback;
};

export const DEFAULT_DEMO_MOTION_PROPS = Object.freeze({
  title: "Scaffold Demo",
  subtitle: "Replace this scene with any React component animation.",
  badgeText: "Vibe Motion",
  videoWidth: 1080,
  videoHeight: 1080,
  durationSeconds: 6,
  speed: 1,
  orbitRadius: 180,
  accentHue: 210,
  backgroundHue: 195,
  cardTiltMax: 12,
});

export const DEMO_MOTION_PARAM_FIELDS = Object.freeze([
  {
    key: "title",
    label: "title",
    control: "text",
    section: "primary",
  },
  {
    key: "subtitle",
    label: "subtitle",
    control: "textarea",
    section: "primary",
  },
  {
    key: "badgeText",
    label: "badgeText",
    control: "text",
    section: "primary",
  },
  {
    key: "videoWidth",
    label: "videoWidth",
    control: "number",
    min: 256,
    max: 3840,
    step: 1,
  },
  {
    key: "videoHeight",
    label: "videoHeight",
    control: "number",
    min: 256,
    max: 3840,
    step: 1,
  },
  {
    key: "durationSeconds",
    label: "durationSeconds",
    control: "number",
    min: 1,
    max: 30,
    step: 0.5,
  },
  {
    key: "speed",
    label: "speed",
    control: "number",
    min: 0.2,
    max: 4,
    step: 0.1,
  },
  {
    key: "orbitRadius",
    label: "orbitRadius",
    control: "number",
    min: 20,
    max: 480,
    step: 1,
  },
  {
    key: "accentHue",
    label: "accentHue",
    control: "number",
    min: 0,
    max: 360,
    step: 1,
  },
  {
    key: "backgroundHue",
    label: "backgroundHue",
    control: "number",
    min: 0,
    max: 360,
    step: 1,
  },
  {
    key: "cardTiltMax",
    label: "cardTiltMax",
    control: "number",
    min: 0,
    max: 30,
    step: 1,
  },
]);

export const normalizeDemoMotionParamValue = ({ key, rawValue, currentValue } = {}) => {
  switch (key) {
    case "title":
      return toText(rawValue, DEFAULT_DEMO_MOTION_PROPS.title);
    case "subtitle":
      return toText(rawValue, DEFAULT_DEMO_MOTION_PROPS.subtitle);
    case "badgeText":
      return toText(rawValue, DEFAULT_DEMO_MOTION_PROPS.badgeText);
    case "videoWidth":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.videoWidth, 256, 3840);
    case "videoHeight":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.videoHeight, 256, 3840);
    case "durationSeconds":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.durationSeconds), 1, 30);
    case "speed":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.speed), 0.2, 4);
    case "orbitRadius":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.orbitRadius, 20, 480);
    case "accentHue":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.accentHue, 0, 360);
    case "backgroundHue":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.backgroundHue, 0, 360);
    case "cardTiltMax":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.cardTiltMax), 0, 30);
    default:
      return currentValue ?? rawValue;
  }
};
