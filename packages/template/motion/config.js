export const DEFAULT_LAYOUT_PARAMS = Object.freeze({
  videoWidth: 1080,
  videoHeight: 1440,
});

export const DEFAULT_ANIMATION_PARAMS = Object.freeze({
  title: "Vibe Motion Demo",
  subtitle: "Replace this scene with any React component animation.",
  badgeText: "Vibe Motion",
  cardDarkMode: false,
  durationSeconds: 3,
  speed: 1,
  cardTiltMax: 12,
});

export const DEFAULT_MOTION_PROPS = Object.freeze({
  ...DEFAULT_LAYOUT_PARAMS,
  ...DEFAULT_ANIMATION_PARAMS,
});
