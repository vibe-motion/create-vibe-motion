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

export const DEFAULT_DEMO_MOTION_PROPS = Object.freeze({
  title: "Scaffold Demo",
  subtitle: "Replace this scene with any React component animation.",
  badgeText: "Vibe Motion",
  cardDarkMode: false,
  videoWidth: 480,
  videoHeight: 480,
  durationSeconds: 3,
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
    key: "cardDarkMode",
    label: "darkCard",
    control: "switch",
    section: "primary",
  },
  {
    key: "videoWidth",
    label: "videoWidth",
    control: "select",
    options: [480, 540, 720, 1080, 1280],
  },
  {
    key: "videoHeight",
    label: "videoHeight",
    control: "select",
    options: [480, 540, 720, 1080, 1280],
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
    control: "range",
    min: 0,
    max: 1,
    step: 0.01,
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
    control: "range",
    min: -30,
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
    case "cardDarkMode":
      return toBoolean(rawValue, DEFAULT_DEMO_MOTION_PROPS.cardDarkMode);
    case "videoWidth":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.videoWidth, 480, 1280);
    case "videoHeight":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.videoHeight, 480, 1280);
    case "durationSeconds":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.durationSeconds), 1, 30);
    case "speed":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.speed), 0, 1);
    case "orbitRadius":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.orbitRadius, 20, 480);
    case "accentHue":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.accentHue, 0, 360);
    case "backgroundHue":
      return toInt(rawValue, DEFAULT_DEMO_MOTION_PROPS.backgroundHue, 0, 360);
    case "cardTiltMax":
      return clamp(toNumber(rawValue, DEFAULT_DEMO_MOTION_PROPS.cardTiltMax), -30, 30);
    default:
      return currentValue ?? rawValue;
  }
};
