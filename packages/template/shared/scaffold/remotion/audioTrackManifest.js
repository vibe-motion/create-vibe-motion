export const AUDIO_TRACK_MANIFEST_PATH = ".vibe-motion/audio-tracks.json";

export const createEmptyAudioTrackManifest = () => ({
  version: 1,
  compositions: {},
});

const toNonNegativeInteger = (value, fallback) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
};

const normalizeTrack = (track, index) => {
  if (!track || typeof track !== "object") {
    return null;
  }

  const src = typeof track.src === "string" ? track.src.replace(/^\/+/, "") : "";
  if (src.length === 0) {
    return null;
  }

  const durationInFrames = Math.max(
    1,
    toNonNegativeInteger(track.durationInFrames, 1)
  );
  const volume =
    typeof track.volume === "number" && Number.isFinite(track.volume)
      ? Math.max(0, track.volume)
      : 1;

  return {
    id:
      typeof track.id === "string" && track.id.length > 0
        ? track.id
        : `audio-track-${index}`,
    name:
      typeof track.name === "string" && track.name.length > 0
        ? track.name
        : src.split("/").pop() ?? "Audio",
    src,
    startFrame: toNonNegativeInteger(track.startFrame, 0),
    durationInFrames,
    volume,
  };
};

export const normalizeAudioTrackManifest = (value) => {
  if (!value || typeof value !== "object") {
    return createEmptyAudioTrackManifest();
  }

  const rawCompositions =
    value.compositions && typeof value.compositions === "object"
      ? value.compositions
      : {};
  const compositions = Object.fromEntries(
    Object.entries(rawCompositions).map(([compositionId, tracks]) => [
      compositionId,
      Array.isArray(tracks)
        ? tracks.map(normalizeTrack).filter((track) => track !== null)
        : [],
    ])
  );

  return {
    version: 1,
    compositions,
  };
};

export const getCompositionAudioTracks = (manifest, compositionId) =>
  manifest?.compositions?.[compositionId] ?? [];

export const removeMissingAudioTracks = ({ manifest, availablePaths }) => {
  const normalizedManifest = normalizeAudioTrackManifest(manifest);
  const availablePathSet =
    availablePaths instanceof Set ? availablePaths : new Set(availablePaths);
  let removedTrackCount = 0;
  const compositions = Object.fromEntries(
    Object.entries(normalizedManifest.compositions).map(
      ([compositionId, tracks]) => {
        const availableTracks = tracks.filter((track) => {
          const exists = availablePathSet.has(track.src);
          if (!exists) {
            removedTrackCount += 1;
          }
          return exists;
        });

        return [compositionId, availableTracks];
      }
    )
  );

  return {
    manifest:
      removedTrackCount === 0
        ? normalizedManifest
        : { ...normalizedManifest, compositions },
    removedTrackCount,
  };
};

export const setCompositionAudioTracks = ({
  manifest,
  compositionId,
  tracks,
}) => {
  const normalizedManifest = normalizeAudioTrackManifest(manifest);

  return {
    ...normalizedManifest,
    compositions: {
      ...normalizedManifest.compositions,
      [compositionId]: tracks,
    },
  };
};
