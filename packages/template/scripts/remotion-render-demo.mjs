// npm scripts 里的 FOO=bar 前缀在 Windows shell 下不生效，所以改由 Node 设默认值。
process.env.REMOTION_OUTPUT ??= "out/motion-defaults-transparent.mov";
process.env.REMOTION_PROPS_FILE ??= "motion/render-presets/default.json";

await import("./remotion-render.mjs");
