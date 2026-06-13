import React from "react";

export const PreviewShell = ({
  controlPanel,
  previewViewportRef,
  stageDisplayWidth,
  stageDisplayHeight,
  stageScale,
  videoWidth,
  videoHeight,
  children,
}) => {
  return (
    <div className="preview-workbench">
      <aside className="preview-controls" aria-label="Preview controls">
        <div className="preview-controls-card scaffold-scrollbar">
          {controlPanel}
        </div>
      </aside>

      <main className="preview-canvas">
        <div
          ref={previewViewportRef}
          className="preview-viewport"
        >
          <div className="relative" style={{ width: stageDisplayWidth, height: stageDisplayHeight }}>
            <div
              className="relative"
              style={{
                width: videoWidth,
                height: videoHeight,
                backgroundColor: "#ffffff",
                backgroundImage:
                  "linear-gradient(45deg, #e9e9e9 25%, transparent 25%), linear-gradient(-45deg, #e9e9e9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e9e9e9 75%), linear-gradient(-45deg, transparent 75%, #e9e9e9 75%)",
                backgroundSize: "28px 28px",
                backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0px",
                transform: `scale(${stageScale})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
