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
  layout,
  onAutoLayoutReady,
}) => {
  useEffect(() => {
    onAutoLayoutReady?.();
  }, [onAutoLayoutReady]);

  const s = (layout?.videoWidth ?? 1080) / 1080;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: "transparent",
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: "68%",
          aspectRatio: "1 / 1",
          left: `calc(50% - ${orbitX * 0.25}px)`,
          top: `calc(50% - ${orbitY * 0.2}px)`,
          transform: "translate(-50%, -50%)",
          filter: `blur(${110 * s}px)`,
          background: `radial-gradient(circle, hsl(${hue(backgroundHue, -6)} 64% 72% / 0.34) 0%, hsl(${hue(
            backgroundHue,
            18
          )} 58% 68% / 0.16) 48%, transparent 76%)`,
        }}
      />

      <div
        className="absolute rounded-full"
        style={{
          width: "52%",
          aspectRatio: "1 / 1",
          left: `calc(50% + ${orbitX * 0.4}px)`,
          top: `calc(44% + ${orbitY * 0.4}px)`,
          transform: "translate(-50%, -50%)",
          filter: `blur(${48 * s}px)`,
          background: `radial-gradient(circle, hsl(${hue(accentHue, 0)} 95% 67% / 0.65) 0%, hsl(${hue(
            accentHue,
            25
          )} 92% 60% / 0.18) 62%, transparent 100%)`,
        }}
      />

      <div
        className="absolute rounded-full border border-white/55 bg-white/70 backdrop-blur"
        style={{
          width: 18 * s,
          height: 18 * s,
          left: `calc(50% + ${orbitX}px)`,
          top: `calc(50% + ${orbitY}px)`,
          transform: "translate(-50%, -50%)",
          boxShadow: `0 ${20 * s}px ${48 * s}px rgba(15,23,42,0.18)`,
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-[8.5%] py-[10%]">
        <div
          className="relative w-full border border-white/65 bg-white/80 backdrop-blur"
          style={{
            maxWidth: 760 * s,
            borderRadius: 42 * s,
            padding: 48 * s,
            boxShadow: `0 ${30 * s}px ${80 * s}px rgba(15,23,42,0.2)`,
            transform: `translate3d(${orbitX * 0.06}px, ${orbitY * 0.04}px, 0) rotate(${cardRotateDeg}deg) scale(${pulseScale})`,
            transformOrigin: "50% 50%",
          }}
        >
          <div
            className="inline-flex items-center rounded-full border font-semibold"
            style={{
              marginBottom: 28 * s,
              padding: `${8 * s}px ${16 * s}px`,
              fontSize: 0.84 * s + "rem",
              letterSpacing: "0.08em",
              color: `hsl(${hue(accentHue, -14)} 82% 28%)`,
              backgroundColor: `hsl(${hue(accentHue, 28)} 95% 78% / 0.5)`,
              borderColor: `hsl(${hue(accentHue, 8)} 80% 62% / 0.5)`,
              transform: `translateX(${chipOffset}px)`,
            }}
          >
            {badgeText}
          </div>

          <h1
            className="font-semibold leading-[1.04] tracking-[-0.03em] text-slate-900"
            style={{
              fontSize: Math.round(48 * s) + "px",
              textShadow: `0 ${8 * s}px ${24 * s}px rgba(148, 163, 184, 0.22)`,
            }}
          >
            {title}
          </h1>

          <p
            className="leading-[1.42] text-slate-700"
            style={{
              marginTop: 24 * s,
              maxWidth: "88%",
              fontSize: Math.round(22 * s) + "px",
            }}
          >
            {subtitle}
          </p>

          <div
            className="overflow-hidden rounded-full bg-slate-300/60"
            style={{ marginTop: 40 * s, height: 10 * s }}
          >
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
