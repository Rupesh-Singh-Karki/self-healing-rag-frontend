"use client";

import {
  Search,
  Cpu,
  ScanEye,
  RefreshCw,
  Ban,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { TraceStep } from "@/types";

interface TracePanelProps {
  trace: TraceStep[];
  activeNode?: string | null;
}

const NODE_ICONS: Record<string, React.ElementType> = {
  retrieve: Search,
  generate: Cpu,
  critic: ScanEye,
  rewrite: RefreshCw,
  refuse: Ban,
};

const NODE_LABELS: Record<string, string> = {
  retrieve: "Retrieve",
  generate: "Generate",
  critic: "Critic",
  rewrite: "Rewrite",
  refuse: "Refuse",
};

function getRetryNumber(trace: TraceStep[], index: number): number | null {
  // Check if this is a rewrite→retrieve boundary (retry indicator goes BEFORE the retrieve)
  if (index === 0) return null;
  const current = trace[index];
  const prev = trace[index - 1];
  if (current.node === "retrieve" && prev.node === "rewrite") {
    // Count how many rewrite nodes appear before this index
    let retryCount = 0;
    for (let i = 0; i < index; i++) {
      if (trace[i].node === "rewrite") retryCount++;
    }
    return retryCount;
  }
  return null;
}

export default function TracePanel({ trace, activeNode }: TracePanelProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <span
        className="font-display text-[12px] uppercase tracking-[0.1em]"
        style={{ color: "var(--text-muted)" }}
      >
        Execution Trace
      </span>

      {/* Content */}
      {trace.length === 0 ? (
        <p
          className="py-6 text-center font-body text-[13px]"
          style={{ color: "var(--text-muted)" }}
        >
          Graph execution will appear here
        </p>
      ) : (
        <div className="flex flex-col">
          {trace.map((step, index) => {
            const retryNum = getRetryNumber(trace, index);
            const isLast = index === trace.length - 1;
            const isActive = step.status === "started" || activeNode === step.node;
            const isDone = step.status === "done";
            const isRefuse = step.node === "refuse";

            // Connector line color
            const prevStep = index > 0 ? trace[index - 1] : null;
            const isRetryConnector =
              prevStep?.node === "rewrite" && step.node === "retrieve";
            const connectorColor = isRetryConnector
              ? "var(--status-warn)"
              : isDone || prevStep?.status === "done"
                ? "var(--status-ok)"
                : "var(--bg-border)";

            // Icon container colors
            let iconBg: string;
            let iconColor: string;
            if (isDone && isRefuse) {
              iconBg = "rgba(248, 113, 113, 0.1)";
              iconColor = "var(--status-fail)";
            } else if (isDone) {
              iconBg = "rgba(74, 222, 128, 0.1)";
              iconColor = "var(--status-ok)";
            } else if (isActive) {
              iconBg = "rgba(45, 212, 191, 0.1)";
              iconColor = "var(--accent)";
            } else {
              iconBg = "var(--bg-raised)";
              iconColor = "var(--text-muted)";
            }

            const IconComponent = NODE_ICONS[step.node] || Search;

            return (
              <div key={`${step.node}-${index}`}>
                {/* Retry indicator pill */}
                {retryNum !== null && (
                  <div className="flex justify-center py-1">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        color: "var(--status-warn)",
                        backgroundColor: "rgba(251, 146, 60, 0.1)",
                      }}
                    >
                      retry {retryNum}
                    </span>
                  </div>
                )}

                {/* Trace node */}
                <motion.div
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, x: -8 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.15,
                    delay: shouldReduceMotion ? 0 : index * 0.06,
                  }}
                  className="flex items-center gap-3 py-1"
                >
                  {/* Icon + Connector column */}
                  <div className="relative flex flex-col items-center">
                    {/* Icon container */}
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded"
                      style={{ backgroundColor: iconBg }}
                    >
                      <IconComponent
                        size={14}
                        strokeWidth={1.5}
                        style={{ color: iconColor }}
                      />
                    </div>

                    {/* Connector line */}
                    {!isLast && (
                      <motion.div
                        className="w-[2px]"
                        style={{
                          backgroundColor: connectorColor,
                          height: 16,
                          transformOrigin: "top",
                        }}
                        initial={
                          shouldReduceMotion ? false : { scaleY: 0 }
                        }
                        animate={{ scaleY: 1 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.3,
                          delay: shouldReduceMotion
                            ? 0
                            : index * 0.06 + 0.1,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="flex-1 font-mono text-[12px]"
                    style={{
                      color: isDone || isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {NODE_LABELS[step.node] || step.node}
                  </span>

                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    {isDone && !isRefuse && (
                      <Check
                        size={12}
                        strokeWidth={1.5}
                        style={{ color: "var(--status-ok)" }}
                      />
                    )}
                    {isDone && isRefuse && (
                      <X
                        size={12}
                        strokeWidth={1.5}
                        style={{ color: "var(--status-fail)" }}
                      />
                    )}
                    {isActive && !isDone && (
                      <Loader2
                        size={12}
                        strokeWidth={1.5}
                        className="animate-spin"
                        style={{ color: "var(--accent)" }}
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
