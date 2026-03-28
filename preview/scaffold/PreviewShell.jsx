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
    <div className="flex h-screen flex-col gap-4 bg-[#eef2f6] p-4 text-slate-900 lg:flex-row">
      <div className="min-h-0 lg:h-full lg:w-[400px] lg:shrink-0">
        <div className="scaffold-scrollbar mx-auto h-full w-[min(1160px,96vw)] rounded-2xl border border-slate-300 bg-white/90 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur lg:mx-0 lg:w-full lg:overflow-y-auto">
          {controlPanel}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <div
          ref={previewViewportRef}
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-300 bg-[linear-gradient(135deg,#f7fafc_0%,#edf2f7_100%)]"
        >
          <div className="relative" style={{ width: stageDisplayWidth, height: stageDisplayHeight }}>
            <div
              className="relative"
              style={{
                width: videoWidth,
                height: videoHeight,
                backgroundColor: "#f8fafc",
                backgroundImage:
                  "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                backgroundSize: "36px 36px",
                backgroundPosition: "0 0, 0 18px, 18px -18px, -18px 0px",
                transform: `scale(${stageScale})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
