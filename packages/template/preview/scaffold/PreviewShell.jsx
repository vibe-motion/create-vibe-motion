import React from "react";

export const PreviewShell = ({
  videoWidth,
  videoHeight,
  children,
}) => {
  return (
    <div
      className="preview-frame-canvas relative overflow-hidden bg-white text-slate-900"
      style={{ width: videoWidth, height: videoHeight }}
    >
      {children}
    </div>
  );
};
