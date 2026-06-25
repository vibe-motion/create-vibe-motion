import { getAudioDurationInSeconds } from "@remotion/media-utils";
import {
  deleteStaticFile,
  getStaticFiles,
  writeStaticFile,
} from "@remotion/studio";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  AUDIO_TRACK_MANIFEST_PATH,
  getCompositionAudioTracks,
  removeAudioTrackAndFileReferences,
  setCompositionAudioTracks,
} from "./audioTrackManifest.js";

const AUDIO_EXTENSIONS = new Set([
  "aac",
  "aif",
  "aiff",
  "caf",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
  "webm",
]);
const TIMELINE_PADDING = 16;
// Remotion 4.0.438 has no public timeline drop API. The template pins that
// version, so these Studio class names are the narrow bridge to its timeline.
const TIMELINE_ROOT_SELECTOR = ".css-reset.__remotion-vertical-scrollbar";
const TIMELINE_SCROLL_SELECTOR = ".__remotion-horizontal-scrollbar";
const DOCUMENT_BINDING_KEY = "__vibeMotionAudioDropBinding";
const DELETE_BUTTON_BINDING_KEY = "__vibeMotionAudioTrackDeleteButtonBinding";

const getExtension = (name) => {
  const lastDot = name.lastIndexOf(".");
  return lastDot === -1 ? "" : name.slice(lastDot + 1).toLowerCase();
};

const isAudioFile = (file) =>
  file.type.startsWith("audio/") || AUDIO_EXTENSIONS.has(getExtension(file.name));

const hasFilePayload = (dataTransfer) => {
  const items = Array.from(dataTransfer?.items ?? []);
  return items.length > 0
    ? items.some((item) => item.kind === "file")
    : (dataTransfer?.files?.length ?? 0) > 0;
};

const findTimelineRoot = (target) =>
  typeof target?.closest === "function"
    ? target.closest(TIMELINE_ROOT_SELECTOR)
    : null;

const findTimelineScroller = (timelineRoot) =>
  timelineRoot.querySelector(TIMELINE_SCROLL_SELECTOR);

const getDropFrame = ({
  clientX,
  durationInFrames,
  timelineRoot,
}) => {
  const scroller = findTimelineScroller(timelineRoot);
  if (!scroller) {
    return 0;
  }

  const bounds = scroller.getBoundingClientRect();
  const timelineWidth = Math.max(scroller.clientWidth, scroller.scrollWidth);
  const x = clientX - bounds.left + scroller.scrollLeft;
  const usableWidth = Math.max(1, timelineWidth - TIMELINE_PADDING * 2);
  const progress = Math.min(
    1,
    Math.max(0, (x - TIMELINE_PADDING) / usableWidth)
  );

  return Math.min(
    durationInFrames - 1,
    Math.max(0, Math.round(progress * (durationInFrames - 1)))
  );
};

const getStudioDocuments = () => {
  const documents = [document];

  try {
    if (window.parent?.document && window.parent.document !== document) {
      documents.push(window.parent.document);
    }
  } catch {
    // A cross-origin parent cannot be the Remotion Studio document.
  }

  return documents;
};

const createDropOverlay = (studioDocument) => {
  const overlay = studioDocument.createElement("div");
  overlay.textContent = "释放以添加音频 · 落点即起始时间";
  Object.assign(overlay.style, {
    alignItems: "center",
    background: "rgba(16, 171, 58, 0.18)",
    border: "2px dashed rgb(43, 205, 83)",
    borderRadius: "6px",
    color: "white",
    display: "flex",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    justifyContent: "center",
    pointerEvents: "none",
    position: "fixed",
    zIndex: "2147483647",
  });
  studioDocument.body.appendChild(overlay);
  return overlay;
};

const positionDropOverlay = (overlay, timelineRoot) => {
  const bounds = timelineRoot.getBoundingClientRect();
  Object.assign(overlay.style, {
    height: `${bounds.height}px`,
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
  });
};

const showToast = (studioDocument, message, type = "success") => {
  const toast = studioDocument.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    background: type === "error" ? "rgb(153, 27, 27)" : "rgb(21, 128, 61)",
    borderRadius: "6px",
    bottom: "24px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
    color: "white",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "13px",
    left: "50%",
    maxWidth: "min(520px, calc(100vw - 32px))",
    padding: "10px 14px",
    position: "fixed",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
  });
  studioDocument.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
};

const isAudioTrackListItem = (element) => {
  if (element?.tagName !== "DIV") {
    return false;
  }

  const style = element.getAttribute("style") ?? "";
  return (
    style.includes("border-bottom:") &&
    style.includes("padding-left:") &&
    element.querySelector("svg") !== null
  );
};

const findAudioTrackListItems = ({ studioDocument, tracks }) => {
  const timelineRoot = studioDocument.querySelector(TIMELINE_ROOT_SELECTOR);
  if (!timelineRoot) {
    return [];
  }

  const candidates = Array.from(
    timelineRoot.querySelectorAll("div")
  ).filter(isAudioTrackListItem);
  const matched = [];
  const usedTrackIds = new Set();

  for (const listItem of candidates) {
    const names = Array.from(listItem.querySelectorAll("div"))
      .map((child) => child.textContent?.trim() ?? "")
      .filter((text) => text.length > 0);

    const trackName = names.find((name) =>
      tracks.some(
        (candidate) =>
          candidate.name === name && !usedTrackIds.has(candidate.id)
      )
    );
    if (!trackName) {
      continue;
    }

    const track = tracks.find(
      (candidate) =>
        candidate.name === trackName && !usedTrackIds.has(candidate.id)
    );
    if (!track) {
      continue;
    }

    usedTrackIds.add(track.id);
    matched.push({ listItem, track });
  }

  return matched;
};

const createDeleteButton = (studioDocument) => {
  const button = studioDocument.createElement("button");
  button.type = "button";
  button.textContent = "✕";
  Object.assign(button.style, {
    alignItems: "center",
    appearance: "none",
    background: "rgba(185, 28, 28, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "11px",
    fontWeight: "700",
    height: "18px",
    justifyContent: "center",
    lineHeight: "1",
    padding: "0",
    pointerEvents: "auto",
    position: "absolute",
    right: "4px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    zIndex: "2147483647",
  });
  return button;
};

const renderTimelineDeleteButtons = ({ studioDocument, tracks, onDelete }) => {
  const items = findAudioTrackListItems({ studioDocument, tracks });
  const matchedIds = new Set(items.map(({ track }) => track.id));

  for (const button of studioDocument.querySelectorAll(
    "[data-vibe-motion-audio-delete]"
  )) {
    const trackId = button.getAttribute("data-vibe-motion-audio-delete");
    if (!matchedIds.has(trackId)) {
      button.remove();
    }
  }

  for (const { listItem, track } of items) {
    if (listItem.querySelector("[data-vibe-motion-audio-delete]")) {
      continue;
    }

    const computed = studioDocument.defaultView?.getComputedStyle(listItem);
    if (computed && computed.position === "static") {
      listItem.style.position = "relative";
    }

    const button = createDeleteButton(studioDocument);
    button.setAttribute("data-vibe-motion-audio-delete", track.id);
    button.title = `删除 ${track.name}`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      onDelete(track.id);
    });

    listItem.appendChild(button);
  }
};



const sanitizeFileName = (name) => {
  const lastDot = name.lastIndexOf(".");
  const rawExtension = lastDot === -1 ? "" : name.slice(lastDot + 1);
  const safeExtension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "");
  const extension = safeExtension.length > 0 ? `.${safeExtension}` : "";
  const rawBase = lastDot === -1 ? name : name.slice(0, lastDot);
  const base = rawBase
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]/g, "-")
    .split("")
    .map((character) => (character.charCodeAt(0) < 32 ? "-" : character))
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 120) || "audio";

  return `${base}${extension}`;
};

const makeAvailableAssetPath = ({ fileName, reservedPaths }) => {
  const safeName = sanitizeFileName(fileName);
  const lastDot = safeName.lastIndexOf(".");
  const extension = lastDot === -1 ? "" : safeName.slice(lastDot);
  const base = lastDot === -1 ? safeName : safeName.slice(0, lastDot);
  let suffix = 1;
  let candidate = `audio/${safeName}`;

  while (reservedPaths.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `audio/${base}-${suffix}${extension}`;
  }

  reservedPaths.add(candidate.toLowerCase());
  return candidate;
};

const getFileDurationInFrames = async ({ file, fps, fallback }) => {
  const objectUrl = URL.createObjectURL(file);

  try {
    const durationInSeconds = await getAudioDurationInSeconds(objectUrl);
    if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
      return fallback;
    }

    return Math.max(1, Math.ceil(durationInSeconds * fps));
  } catch {
    return fallback;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const createTrackId = () => {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `audio-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const StudioAudioDropTarget = ({
  compositionId,
  durationInFrames,
  fps,
  manifest,
  onManifestChange,
}) => {
  const busyRef = useRef(false);
  const manifestRef = useRef(manifest);
  manifestRef.current = manifest;
  const tracks = useMemo(
    () => getCompositionAudioTracks(manifest, compositionId),
    [compositionId, manifest]
  );

  const importFiles = useCallback(
    async ({ files, startFrame, studioDocument }) => {
      if (busyRef.current) {
        showToast(studioDocument, "已有音频正在导入，请稍候", "error");
        return;
      }

      const audioFiles = files.filter(isAudioFile);
      if (audioFiles.length === 0) {
        showToast(studioDocument, "未检测到支持的音频文件", "error");
        return;
      }

      busyRef.current = true;
      showToast(studioDocument, `正在导入 ${audioFiles.length} 个音频文件…`);

      try {
        const reservedPaths = new Set(
          getStaticFiles().map((file) => file.name.toLowerCase())
        );
        const importedTracks = [];

        for (const file of audioFiles) {
          const assetPath = makeAvailableAssetPath({
            fileName: file.name,
            reservedPaths,
          });
          const durationPromise = getFileDurationInFrames({
            file,
            fps,
            fallback: Math.max(1, durationInFrames - startFrame),
          });
          const contentsPromise = file.arrayBuffer();
          const [duration, contents] = await Promise.all([
            durationPromise,
            contentsPromise,
          ]);

          await writeStaticFile({ contents, filePath: assetPath });
          importedTracks.push({
            id: createTrackId(),
            name: file.name,
            src: assetPath,
            startFrame,
            durationInFrames: duration,
            volume: 1,
          });
        }

        const currentTracks = getCompositionAudioTracks(
          manifestRef.current,
          compositionId
        );
        const nextManifest = setCompositionAudioTracks({
          manifest: manifestRef.current,
          compositionId,
          tracks: [...currentTracks, ...importedTracks],
        });

        await writeStaticFile({
          contents: `${JSON.stringify(nextManifest, null, 2)}\n`,
          filePath: AUDIO_TRACK_MANIFEST_PATH,
        });
        manifestRef.current = nextManifest;
        onManifestChange(nextManifest);
        showToast(
          studioDocument,
          `已添加 ${importedTracks.length} 条音频轨道，起始帧 ${startFrame}`
        );
      } catch (error) {
        showToast(
          studioDocument,
          `音频导入失败：${error instanceof Error ? error.message : String(error)}`,
          "error"
        );
      } finally {
        busyRef.current = false;
      }
    },
    [compositionId, durationInFrames, fps, onManifestChange]
  );

  const deleteTrack = useCallback(
    async ({ trackId, studioDocument }) => {
      if (busyRef.current) {
        showToast(studioDocument, "已有音频操作正在进行，请稍候", "error");
        return;
      }

      let removal = removeAudioTrackAndFileReferences({
        manifest: manifestRef.current,
        compositionId,
        trackId,
      });
      if (!removal.targetTrack) {
        showToast(studioDocument, "音频轨道不存在，可能已被删除", "error");
        return;
      }

      const confirmed = studioDocument.defaultView?.confirm(
        `删除音频轨道“${removal.targetTrack.name}”？\n同时会删除 public/${removal.targetTrack.src} 文件。`
      );
      if (confirmed === false) {
        return;
      }

      busyRef.current = true;
      try {
        removal = removeAudioTrackAndFileReferences({
          manifest: manifestRef.current,
          compositionId,
          trackId,
        });
        if (!removal.targetTrack) {
          showToast(studioDocument, "音频轨道不存在，可能已被删除", "error");
          return;
        }

        await deleteStaticFile(removal.targetTrack.src);
        await writeStaticFile({
          contents: `${JSON.stringify(removal.manifest, null, 2)}\n`,
          filePath: AUDIO_TRACK_MANIFEST_PATH,
        });
        manifestRef.current = removal.manifest;
        onManifestChange(removal.manifest);
        showToast(
          studioDocument,
          `已删除 ${removal.removedTrackCount} 条音频轨道和文件 ${removal.targetTrack.src}`
        );
      } catch (error) {
        showToast(
          studioDocument,
          `音频删除失败：${error instanceof Error ? error.message : String(error)}`,
          "error"
        );
      } finally {
        busyRef.current = false;
      }
    },
    [compositionId, onManifestChange]
  );

  useEffect(() => {
    if (window.remotion_isReadOnlyStudio) {
      return undefined;
    }

    const cleanups = getStudioDocuments().map((studioDocument) => {
      studioDocument[DOCUMENT_BINDING_KEY]?.dispose();

      let overlay = null;
      const bindingToken = {};

      const hideOverlay = () => {
        overlay?.remove();
        overlay = null;
      };

      const onDragOver = (event) => {
        const timelineRoot = findTimelineRoot(event.target);
        if (!timelineRoot || !hasFilePayload(event.dataTransfer)) {
          hideOverlay();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "copy";
        }
        overlay ??= createDropOverlay(studioDocument);
        positionDropOverlay(overlay, timelineRoot);
      };

      const onDrop = (event) => {
        const timelineRoot = findTimelineRoot(event.target);
        if (!timelineRoot) {
          hideOverlay();
          return;
        }

        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.length === 0) {
          hideOverlay();
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (!files.some(isAudioFile)) {
          hideOverlay();
          showToast(studioDocument, "未检测到支持的音频文件", "error");
          return;
        }

        const startFrame = getDropFrame({
          clientX: event.clientX,
          durationInFrames,
          timelineRoot,
        });
        hideOverlay();
        void importFiles({ files, startFrame, studioDocument });
      };

      const onDragEnd = () => hideOverlay();
      const onDragLeave = (event) => {
        if (event.relatedTarget === null) {
          hideOverlay();
        }
      };
      studioDocument.addEventListener("dragover", onDragOver, true);
      studioDocument.addEventListener("drop", onDrop, true);
      studioDocument.addEventListener("dragend", onDragEnd, true);
      studioDocument.addEventListener("dragleave", onDragLeave, true);

      const dispose = () => {
        hideOverlay();
        studioDocument.removeEventListener("dragover", onDragOver, true);
        studioDocument.removeEventListener("drop", onDrop, true);
        studioDocument.removeEventListener("dragend", onDragEnd, true);
        studioDocument.removeEventListener("dragleave", onDragLeave, true);
      };
      studioDocument[DOCUMENT_BINDING_KEY] = {
        dispose,
        token: bindingToken,
      };

      return () => {
        if (studioDocument[DOCUMENT_BINDING_KEY]?.token !== bindingToken) {
          return;
        }

        dispose();
        delete studioDocument[DOCUMENT_BINDING_KEY];
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [durationInFrames, importFiles]);

  useEffect(() => {
    if (window.remotion_isReadOnlyStudio) {
      return undefined;
    }

    const studioDocument = getStudioDocuments().at(-1);
    studioDocument[DELETE_BUTTON_BINDING_KEY]?.dispose();

    const bindingToken = {};
    let rafId = null;

    const render = () => {
      renderTimelineDeleteButtons({
        studioDocument,
        tracks,
        onDelete: (trackId) => {
          void deleteTrack({ trackId, studioDocument });
        },
      });
    };

    const scheduleRender = () => {
      if (rafId !== null) {
        return;
      }

      rafId = studioDocument.defaultView?.requestAnimationFrame(() => {
        rafId = null;
        render();
      });
    };

    render();

    const timelineRoot = studioDocument.querySelector(TIMELINE_ROOT_SELECTOR);
    const observer = timelineRoot
      ? new MutationObserver(() => {
          scheduleRender();
        })
      : null;
    observer?.observe(timelineRoot, { childList: true, subtree: true });
    studioDocument.defaultView?.addEventListener("resize", scheduleRender, {
      passive: true,
    });

    const dispose = () => {
      if (rafId !== null) {
        studioDocument.defaultView?.cancelAnimationFrame(rafId);
        rafId = null;
      }

      observer?.disconnect();
      studioDocument.defaultView?.removeEventListener("resize", scheduleRender);
      for (const button of studioDocument.querySelectorAll(
        "[data-vibe-motion-audio-delete]"
      )) {
        button.remove();
      }
    };

    studioDocument[DELETE_BUTTON_BINDING_KEY] = {
      dispose,
      token: bindingToken,
    };

    return () => {
      if (studioDocument[DELETE_BUTTON_BINDING_KEY]?.token !== bindingToken) {
        return;
      }

      dispose();
      delete studioDocument[DELETE_BUTTON_BINDING_KEY];
    };
  }, [deleteTrack, tracks]);

  return null;
};
