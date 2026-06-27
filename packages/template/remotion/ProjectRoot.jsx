import React from "react";
import { ACTIVE_COMPOSITION } from "../motion/project.js";
import { CompositionRoot } from "./CompositionRoot.jsx";

export const ProjectRoot = () => {
  return (
    <CompositionRoot
      compositionId={ACTIVE_COMPOSITION.id}
      fps={ACTIVE_COMPOSITION.fps}
      plugin={ACTIVE_COMPOSITION.plugin}
    />
  );
};
