import React, { useEffect } from "react";

const hue = (baseHue, offset) => (baseHue + offset + 360) % 360;

export const DemoMotionScene = ({
  title,
  subtitle,
  badgeText,
  cardDarkMode,
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
  const isDarkCard = Boolean(cardDarkMode);
  const cardSurfaceStyle = isDarkCard
    ? {
        backgroundColor: "hsl(224 38% 13% / 0.78)",
        borderColor: "hsl(214 32% 75% / 0.34)",
        boxShadow: `0 ${34 * s}px ${92 * s}px rgba(2, 6, 23, 0.52)`,
      }
    : {
        backgroundColor: "hsl(0 0% 100% / 0.8)",
        borderColor: "hsl(0 0% 100% / 0.65)",
        boxShadow: `0 ${30 * s}px ${80 * s}px rgba(15,23,42,0.2)`,
      };

  const badgeStyle = isDarkCard
    ? {
        color: `hsl(${hue(accentHue, 2)} 94% 86%)`,
        backgroundColor: `hsl(${hue(accentHue, 4)} 86% 56% / 0.22)`,
        borderColor: `hsl(${hue(accentHue, 8)} 82% 68% / 0.55)`,
      }
    : {
        color: `hsl(${hue(accentHue, -14)} 82% 28%)`,
        backgroundColor: `hsl(${hue(accentHue, 28)} 95% 78% / 0.5)`,
        borderColor: `hsl(${hue(accentHue, 8)} 80% 62% / 0.5)`,
      };

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
        className={`absolute rounded-full border backdrop-blur ${
          isDarkCard ? "border-white/25 bg-slate-900/65" : "border-white/55 bg-white/70"
        }`}
        style={{
          width: 18 * s,
          height: 18 * s,
          left: `calc(50% + ${orbitX}px)`,
          top: `calc(50% + ${orbitY}px)`,
          transform: "translate(-50%, -50%)",
          boxShadow: isDarkCard
            ? `0 ${22 * s}px ${54 * s}px rgba(2, 6, 23, 0.36)`
            : `0 ${20 * s}px ${48 * s}px rgba(15,23,42,0.18)`,
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-[8.5%] py-[10%]">
        <div
          className="relative w-full border backdrop-blur"
          style={{
            maxWidth: 760 * s,
            borderRadius: 42 * s,
            padding: 48 * s,
            transform: `translate3d(${orbitX * 0.06}px, ${orbitY * 0.04}px, 0) rotate(${cardRotateDeg}deg) scale(${pulseScale})`,
            transformOrigin: "50% 50%",
            ...cardSurfaceStyle,
          }}
        >
          <div
            className="inline-flex items-center rounded-full border font-semibold"
            style={{
              marginBottom: 28 * s,
              padding: `${8 * s}px ${16 * s}px`,
              fontSize: 0.84 * s + "rem",
              letterSpacing: "0.08em",
              transform: `translateX(${chipOffset}px)`,
              ...badgeStyle,
            }}
          >
            {badgeText}
          </div>

          <h1
            className="font-semibold leading-[1.04] tracking-[-0.03em]"
            style={{
              fontSize: Math.round(48 * s) + "px",
              color: isDarkCard ? "hsl(210 40% 98%)" : "hsl(222 47% 11%)",
              textShadow: isDarkCard
                ? `0 ${10 * s}px ${32 * s}px rgba(15, 23, 42, 0.45)`
                : `0 ${8 * s}px ${24 * s}px rgba(148, 163, 184, 0.22)`,
            }}
          >
            {title}
          </h1>

          <p
            className="leading-[1.42]"
            style={{
              marginTop: 24 * s,
              maxWidth: "88%",
              fontSize: Math.round(22 * s) + "px",
              color: isDarkCard ? "hsl(215 26% 84%)" : "hsl(215 25% 37%)",
            }}
          >
            {subtitle}
          </p>

          <div
            className="overflow-hidden rounded-full"
            style={{
              marginTop: 40 * s,
              height: 10 * s,
              backgroundColor: isDarkCard
                ? "hsl(217 30% 27% / 0.56)"
                : "hsl(215 23% 82% / 0.6)",
            }}
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
