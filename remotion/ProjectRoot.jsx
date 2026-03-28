import React from "react";
import { ACTIVE_COMPOSITION, ACTIVE_PLUGIN } from "../shared/project/activeProject.js";
import { ScaffoldRoot } from "../shared/scaffold/remotion/ScaffoldRoot.jsx";

export const ProjectRoot = () => {
  return (
    <ScaffoldRoot
      compositionId={ACTIVE_COMPOSITION.id}
      fps={ACTIVE_COMPOSITION.fps}
      plugin={ACTIVE_PLUGIN}
    />
  );
};
