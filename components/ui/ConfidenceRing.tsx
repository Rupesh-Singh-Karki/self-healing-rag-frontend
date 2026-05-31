"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

interface ConfidenceRingProps {
  score: number; // 0-1
  size?: number;
}

export default function ConfidenceRing({
  score,
  size = 64,
}: ConfidenceRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const hasAnimated = useRef(false);

  // Color based on score
  const color =
    score >= 0.8
      ? "var(--status-ok)"
      : score >= 0.5
        ? "var(--status-warn)"
        : "var(--status-fail)";

  // SVG circle properties
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Transform progress (0-1) to stroke dashoffset
  const strokeDashoffset = useTransform(
    progress,
    [0, 1],
    [circumference, circumference * (1 - score)]
  );

  // Animated percentage text
  const displayPercent = useTransform(progress, [0, 1], [0, score * 100]);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldReduceMotion) {
      progress.set(1);
      return;
    }

    animate(progress, 1, {
      duration: 0.8,
      ease: "easeOut",
    });
  }, [progress, shouldReduceMotion, score]);

  const center = size / 2;

  return (
    <div
      className="relative flex flex-shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--bg-border)"
          strokeWidth={strokeWidth}
        />
        {/* Fill arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="font-mono text-[14px] font-medium"
          style={{ color }}
        >
          {shouldReduceMotion ? (
            `${Math.round(score * 100)}%`
          ) : (
            <AnimatedPercent value={displayPercent} />
          )}
        </motion.span>
      </div>
    </div>
  );
}

// Sub-component for animated percentage display
function AnimatedPercent({
  value,
}: {
  value: MotionValue<number>;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = value.on("change", (v: number) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(v)}%`;
      }
    });
    return unsubscribe;
  }, [value]);

  return <span ref={ref}>0%</span>;
}

