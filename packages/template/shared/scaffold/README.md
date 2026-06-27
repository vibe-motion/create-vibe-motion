# Remotion Scaffold Contract

This project now separates scaffold runtime from feature logic.

## Directory Split

- `preview/*`: static first-frame preview shell.
- `remotion/*`: project-level remotion entry wrappers only.
- `shared/scaffold/*`: common plugin runtime helpers (pure scaffold layer).
- `shared/scaffold/remotion/*`: remotion runtime (pure scaffold layer).
- `shared/project/*`: project binding (plugins/compositions registry + active selection).
- `shared/features/*`: feature-specific scene/component/timing logic.

## Plugin Contract

A feature plugin should provide:

- `id`
- `defaultProps`
- `SceneComponent`
- `resolveSceneContext(pluginParams)`
- `getDurationInFrames({ fps, sceneContext, pluginParams })`
- `buildSceneProps({ frame, fps, loop, sceneContext, pluginParams })`
- `getLayout({ sceneContext, sceneProps, pluginParams })`
- `renderScene(...)` (optional, preview-only custom render)
- `waitForSceneLayoutReady` (optional, default `false`; set `true` if scene needs async layout settle before render continue)

Animation logic in `buildSceneProps` should be frame-deterministic (pure function of inputs) because Remotion may render frames out of order/in parallel.

### Preview

The Vite preview renders only frame `0` with default plugin props. It does not
run an animation clock or expose parameter controls.

### Parameter Semantics

- Keep `videoWidth` / `videoHeight` as video layout params.
- Treat other params in `defaultProps` as current-feature animation params.
- When replacing the default animation/plugin, replace those animation params together with scene logic.

## How To Switch Feature

1. Add a new plugin under `shared/features/<your-feature>/...` (current default example: `shared/features/demoMotion`).
2. Register it in `shared/project/projectRegistry.js` (`PROJECT_PLUGINS`).
3. Add/adjust composition in `PROJECT_COMPOSITIONS` and point `pluginId` to the new plugin.
4. Change `ACTIVE_COMPOSITION_ID` in `shared/project/projectConfig.js`.

No other preview/remotion runtime file needs to change.

## Extraction Guide

To extract a clean scaffold for another project, keep:

- `preview/scaffold/*`
- `shared/scaffold/*`
- `shared/scaffold/remotion/*`
- `remotion/index.jsx` + a thin `remotion/ProjectRoot.jsx` wrapper

Then replace only:

- `shared/features/*` (new feature plugins/scenes/components)
- `shared/project/projectRegistry.js` (project plugin/composition registry)
- `shared/project/projectConfig.js` (active composition selection)

## Script Naming

- `preview:*`: preview app lifecycle (`preview:dev`, `preview:build`, `preview:serve`)
- `remotion:*`: remotion lifecycle (`remotion:studio`, `remotion:compositions`, `remotion:render`)
- short alias `dev` is kept for convenience

## Studio audio tracks

Drag one or more audio files from the system file manager onto the Remotion Studio
timeline. The horizontal drop position becomes the audio start frame. Imported files
are copied to `public/audio`, while track placement is persisted in
`public/.vibe-motion/audio-tracks.json`, so Studio preview and CLI rendering use the
same audio tracks.

Imported tracks appear in a small Remotion Studio panel. Deleting a track from
that panel removes the manifest entry and deletes the corresponding file from
`public/audio`.

The Studio reconciles the manifest with `public` on startup and whenever that
folder changes. Deleting an imported file removes its stale track automatically.
Deleting the manifest clears all tracks and recreates an empty manifest.
