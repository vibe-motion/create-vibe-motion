import React, { useEffect } from "react";

export const MotionScene = ({
  title,
  subtitle,
  badgeText,
  cardDarkMode,
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
        color: "hsl(212 94% 86%)",
        backgroundColor: "hsl(214 86% 56% / 0.22)",
        borderColor: "hsl(218 82% 68% / 0.55)",
      }
    : {
        color: "hsl(196 82% 28%)",
        backgroundColor: "hsl(238 95% 78% / 0.5)",
        borderColor: "hsl(218 80% 62% / 0.5)",
      };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundColor: "transparent",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-[8.5%] py-[10%]">
        <div
          className="relative w-full border backdrop-blur"
          style={{
            maxWidth: 760 * s,
            borderRadius: 42 * s,
            padding: 48 * s,
            transform: `rotate(${cardRotateDeg}deg)`,
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
                background:
                  "linear-gradient(90deg, hsl(200 88% 52%), hsl(238 92% 58%))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
