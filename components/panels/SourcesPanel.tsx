"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Chunk } from "@/types";

interface SourcesPanelProps {
  chunks: Chunk[];
}

export default function SourcesPanel({ chunks }: SourcesPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className="font-display text-[12px] uppercase tracking-[0.1em]"
          style={{ color: "var(--text-muted)" }}
        >
          Sources
        </span>
        {chunks.length > 0 && (
          <span
            className="rounded border px-1.5 py-0.5 font-mono text-[11px]"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--bg-border)",
            }}
          >
            {chunks.length}
          </span>
        )}
      </div>

      {/* Content */}
      {chunks.length === 0 ? (
        <p
          className="py-6 text-center font-body text-[13px]"
          style={{ color: "var(--text-muted)" }}
        >
          Relevant passages will appear here
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {chunks.map((chunk) => (
            <SourceCard key={chunk.id} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceCard({ chunk }: { chunk: Chunk }) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const barColor =
    chunk.score > 0.85
      ? "var(--status-ok)"
      : chunk.score >= 0.65
        ? "var(--accent)"
        : "var(--status-warn)";

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="w-full cursor-pointer rounded-lg border p-3 text-left transition-all duration-150"
      style={{
        borderColor: "var(--bg-border)",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.3)";
        e.currentTarget.style.backgroundColor = "var(--bg-raised)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--bg-border)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-expanded={expanded}
      aria-label={`Source from ${chunk.document_name}, page ${chunk.page}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <FileText
            size={12}
            strokeWidth={1.5}
            className="flex-shrink-0"
            style={{ color: "var(--text-secondary)" }}
          />
          <span
            className="truncate font-body text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {chunk.document_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            p.{chunk.page}
          </span>
          {expanded ? (
            <ChevronUp
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--text-muted)" }}
            />
          ) : (
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </div>
      </div>

      {/* Relevance bar */}
      <div
        className="mt-2 h-[3px] w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--bg-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${chunk.score * 100}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Chunk text */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
            className="overflow-hidden"
          >
            <p
              className="mt-2 font-body text-[13px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {chunk.text}
            </p>
          </motion.div>
        ) : (
          <p
            className="mt-2 line-clamp-2 font-body text-[13px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {chunk.text}
          </p>
        )}
      </AnimatePresence>
    </button>
  );
}
