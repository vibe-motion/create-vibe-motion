import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Audio,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  getRemotionEnvironment,
  staticFile,
  useVideoConfig,
} from "remotion";
import {
  getStaticFiles,
  watchPublicFolder,
  writeStaticFile,
} from "@remotion/studio";
import {
  AUDIO_TRACK_MANIFEST_PATH,
  createEmptyAudioTrackManifest,
  getCompositionAudioTracks,
  normalizeAudioTrackManifest,
  removeMissingAudioTracks,
} from "./audioTrackManifest.js";
import { StudioAudioDropTarget } from "./StudioAudioDropTarget.jsx";

const loadAudioTrackManifest = async () => {
  const response = await fetch(staticFile(AUDIO_TRACK_MANIFEST_PATH), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return createEmptyAudioTrackManifest();
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load audio track manifest (${response.status} ${response.statusText})`
    );
  }

  return normalizeAudioTrackManifest(await response.json());
};

export const AudioTracks = () => {
  const { durationInFrames, fps, id: compositionId } = useVideoConfig();
  const isStudio = getRemotionEnvironment().isStudio;
  const [manifest, setManifest] = useState(null);
  const [publicFolderReady, setPublicFolderReady] = useState(!isStudio);
  const manifestRef = useRef(null);
  const manifestLastModifiedRef = useRef(null);
  const publicFolderSyncQueueRef = useRef(Promise.resolve());
  const publicFolderSyncRequestRef = useRef(0);
  const [manifestHandle] = useState(() =>
    delayRender("Loading audio tracks")
  );
  const manifestLoaded = manifest !== null;

  const applyManifest = useCallback((nextManifest) => {
    manifestRef.current = nextManifest;
    setManifest(nextManifest);
  }, []);

  const synchronizePublicFolder = useCallback(async () => {
    const staticFiles = getStaticFiles();
    const manifestFile = staticFiles.find(
      (file) => file.name === AUDIO_TRACK_MANIFEST_PATH
    );
    let currentManifest =
      manifestRef.current ?? createEmptyAudioTrackManifest();
    let shouldPersistManifest = false;

    if (!manifestFile) {
      currentManifest = createEmptyAudioTrackManifest();
      manifestLastModifiedRef.current = null;
      shouldPersistManifest = true;
    } else if (
      manifestLastModifiedRef.current !== manifestFile.lastModified
    ) {
      currentManifest = await loadAudioTrackManifest();
      manifestLastModifiedRef.current = manifestFile.lastModified;
    }

    const { manifest: reconciledManifest, removedTrackCount } =
      removeMissingAudioTracks({
        manifest: currentManifest,
        availablePaths: new Set(staticFiles.map((file) => file.name)),
      });

    if (removedTrackCount > 0) {
      shouldPersistManifest = true;
      console.info(
        `[vibe-motion] Removed ${removedTrackCount} audio track(s) whose files no longer exist.`
      );
    }

    applyManifest(reconciledManifest);

    if (shouldPersistManifest) {
      await writeStaticFile({
        contents: `${JSON.stringify(reconciledManifest, null, 2)}\n`,
        filePath: AUDIO_TRACK_MANIFEST_PATH,
      });
    }
  }, [applyManifest]);

  const enqueuePublicFolderSync = useCallback(() => {
    const nextSync = publicFolderSyncQueueRef.current.then(() =>
      synchronizePublicFolder()
    );
    const handledSync = nextSync
      .then(() => true)
      .catch((error) => {
        console.error("[vibe-motion] Failed to synchronize audio tracks:", error);
        return false;
      });
    publicFolderSyncQueueRef.current = handledSync.then(() => undefined);
    return handledSync;
  }, [synchronizePublicFolder]);

  const requestPublicFolderSync = useCallback(() => {
    const requestId = publicFolderSyncRequestRef.current + 1;
    publicFolderSyncRequestRef.current = requestId;
    setPublicFolderReady(false);
    enqueuePublicFolderSync().then((success) => {
      if (publicFolderSyncRequestRef.current === requestId) {
        setPublicFolderReady(success);
      }
    });
  }, [enqueuePublicFolderSync]);

  useEffect(() => {
    let active = true;

    loadAudioTrackManifest()
      .then((nextManifest) => {
        if (active) {
          applyManifest(nextManifest);
        }
      })
      .catch((error) => cancelRender(error))
      .finally(() => continueRender(manifestHandle));

    return () => {
      active = false;
    };
  }, [applyManifest, manifestHandle]);

  useEffect(() => {
    if (!isStudio) {
      return undefined;
    }

    const watcher = watchPublicFolder(() => requestPublicFolderSync());
    return () => {
      publicFolderSyncRequestRef.current += 1;
      watcher.cancel();
    };
  }, [isStudio, requestPublicFolderSync]);

  useEffect(() => {
    if (!isStudio || !manifestLoaded) {
      return;
    }

    const manifestFile = getStaticFiles().find(
      (file) => file.name === AUDIO_TRACK_MANIFEST_PATH
    );
    manifestLastModifiedRef.current = manifestFile?.lastModified ?? null;
    requestPublicFolderSync();
  }, [isStudio, manifestLoaded, requestPublicFolderSync]);

  const tracks = useMemo(
    () =>
      publicFolderReady
        ? getCompositionAudioTracks(manifest, compositionId)
        : [],
    [compositionId, manifest, publicFolderReady]
  );

  return (
    <>
      {tracks.map((track) => (
        <Sequence
          key={track.id}
          durationInFrames={track.durationInFrames}
          from={track.startFrame}
          postmountFor={Math.max(
            0,
            durationInFrames - track.startFrame - track.durationInFrames
          )}
          premountFor={track.startFrame}
          showInTimeline={false}
        >
          <Audio
            name={track.name}
            showInTimeline
            src={staticFile(track.src)}
            volume={track.volume}
          />
        </Sequence>
      ))}
      {isStudio && manifest && publicFolderReady ? (
        <StudioAudioDropTarget
          compositionId={compositionId}
          durationInFrames={durationInFrames}
          fps={fps}
          manifest={manifest}
          onManifestChange={applyManifest}
        />
      ) : null}
    </>
  );
};
