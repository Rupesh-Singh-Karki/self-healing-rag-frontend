"use client";

import { CheckCircle2 } from "lucide-react";
import ConfidenceRing from "@/components/ui/ConfidenceRing";
import { CriticResult } from "@/types";

interface CriticPanelProps {
  critic: CriticResult | null;
}

const ISSUE_LABELS: Record<string, string> = {
  unsupported_claims: "Unsupported claims",
  missing_evidence: "Missing evidence",
  contradicts_context: "Contradicts context",
};

export default function CriticPanel({ critic }: CriticPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <span
        className="font-display text-[12px] uppercase tracking-[0.1em]"
        style={{ color: "var(--text-muted)" }}
      >
        Critic
      </span>

      {/* Content */}
      {!critic ? (
        <p
          className="py-6 text-center font-body text-[13px]"
          style={{ color: "var(--text-muted)" }}
        >
          Evaluation results will appear here
        </p>
      ) : (
        <CriticCard critic={critic} />
      )}
    </div>
  );
}

function CriticCard({ critic }: { critic: CriticResult }) {
  const hasIssues = critic.issues.length > 0;

  return (
    <div className="flex items-start gap-4">
      {/* Left — Confidence Ring */}
      <ConfidenceRing score={critic.score} size={64} />

      {/* Right — Verdict + Issues */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Verdict badge */}
        <span
          className="inline-flex w-fit rounded px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em]"
          style={{
            backgroundColor: critic.grounded
              ? "rgba(74, 222, 128, 0.15)"
              : "rgba(248, 113, 113, 0.15)",
            color: critic.grounded
              ? "var(--status-ok)"
              : "var(--status-fail)",
          }}
        >
          {critic.grounded ? "Grounded" : "Not Grounded"}
        </span>

        {/* Issues list or clean state */}
        {hasIssues ? (
          <div className="flex flex-col gap-1">
            {critic.issues
              .filter((issue) => issue !== "none")
              .map((issue) => (
                <div key={issue} className="flex items-center gap-2">
                  <span
                    className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--status-warn)" }}
                  />
                  <span
                    className="font-body text-[12px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {ISSUE_LABELS[issue] || issue}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              size={13}
              strokeWidth={1.5}
              style={{ color: "var(--status-ok)" }}
            />
            <span
              className="font-body text-[12px]"
              style={{ color: "var(--text-secondary)" }}
            >
              No issues detected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
