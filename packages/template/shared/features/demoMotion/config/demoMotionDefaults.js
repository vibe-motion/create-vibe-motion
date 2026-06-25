export const DEFAULT_TEMPLATE_LAYOUT_PARAMS = Object.freeze({
  videoWidth: 1080,
  videoHeight: 1440,
});

export const DEFAULT_DEMO_MOTION_ANIMATION_PARAMS = Object.freeze({
  title: "Scaffold Demo",
  subtitle: "Replace this scene with any React component animation.",
  badgeText: "Vibe Motion",
  cardDarkMode: false,
  durationSeconds: 3,
  speed: 1,
  cardTiltMax: 12,
});

export const DEFAULT_DEMO_MOTION_PLUGIN_PARAMS = Object.freeze({
  ...DEFAULT_TEMPLATE_LAYOUT_PARAMS,
  ...DEFAULT_DEMO_MOTION_ANIMATION_PARAMS,
});

export const DEFAULT_DEMO_MOTION_PROPS = DEFAULT_DEMO_MOTION_PLUGIN_PARAMS;
