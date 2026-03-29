import React, { useEffect } from "react";

const hue = (baseHue, offset) => (baseHue + offset + 360) % 360;

export const DemoMotionScene = ({
  title,
  subtitle,
  badgeText,
  accentHue,
  backgroundHue,
  orbitX,
  orbitY,
  pulseScale,
  cardRotateDeg,
  chipOffset,
  progress,
  onAutoLayoutReady,
}) => {
  useEffect(() => {
    onAutoLayoutReady?.();
  }, [onAutoLayoutReady]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: "transparent",
      }}
    >
      <div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: "68%",
          aspectRatio: "1 / 1",
          left: `calc(50% - ${orbitX * 0.25}px)`,
          top: `calc(50% - ${orbitY * 0.2}px)`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, hsl(${hue(backgroundHue, -6)} 64% 72% / 0.34) 0%, hsl(${hue(
            backgroundHue,
            18
          )} 58% 68% / 0.16) 48%, transparent 76%)`,
        }}
      />

      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "52%",
          aspectRatio: "1 / 1",
          left: `calc(50% + ${orbitX * 0.4}px)`,
          top: `calc(44% + ${orbitY * 0.4}px)`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, hsl(${hue(accentHue, 0)} 95% 67% / 0.65) 0%, hsl(${hue(
            accentHue,
            25
          )} 92% 60% / 0.18) 62%, transparent 100%)`,
        }}
      />

      <div
        className="absolute rounded-full border border-white/55 bg-white/70 shadow-[0_20px_48px_rgba(15,23,42,0.18)] backdrop-blur"
        style={{
          width: 18,
          height: 18,
          left: `calc(50% + ${orbitX}px)`,
          top: `calc(50% + ${orbitY}px)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-[8.5%] py-[10%]">
        <div
          className="relative w-full max-w-[760px] rounded-[42px] border border-white/65 bg-white/80 p-12 shadow-[0_30px_80px_rgba(15,23,42,0.2)] backdrop-blur"
          style={{
            transform: `translate3d(${orbitX * 0.06}px, ${orbitY * 0.04}px, 0) rotate(${cardRotateDeg}deg) scale(${pulseScale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <div
            className="mb-7 inline-flex items-center rounded-full border px-4 py-2 text-[0.84rem] font-semibold tracking-[0.08em]"
            style={{
              color: `hsl(${hue(accentHue, -14)} 82% 28%)`,
              backgroundColor: `hsl(${hue(accentHue, 28)} 95% 78% / 0.5)`,
              borderColor: `hsl(${hue(accentHue, 8)} 80% 62% / 0.5)`,
              transform: `translateX(${chipOffset}px)`,
            }}
          >
            {badgeText}
          </div>

          <h1
            className="text-[clamp(2rem,4.8vw,4.2rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-slate-900"
            style={{
              textShadow: "0 8px 24px rgba(148, 163, 184, 0.22)",
            }}
          >
            {title}
          </h1>

          <p className="mt-6 max-w-[88%] text-[clamp(1.02rem,2.2vw,1.56rem)] leading-[1.42] text-slate-700">
            {subtitle}
          </p>

          <div className="mt-10 h-2.5 overflow-hidden rounded-full bg-slate-300/60">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(8, progress * 100)}%`,
                background: `linear-gradient(90deg, hsl(${hue(accentHue, -10)} 88% 52%), hsl(${hue(
                  accentHue,
                  28
                )} 92% 58%))`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
