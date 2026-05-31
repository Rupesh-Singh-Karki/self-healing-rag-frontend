"use client";

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "What is the PTO policy?",
  "Who is eligible for remote work?",
  "Summarize the benefits overview",
];

export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex max-w-md flex-col items-center gap-6">
      {/* SVG Illustration — three overlapping document rectangles */}
      <svg
        width="120"
        height="90"
        viewBox="0 0 120 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="28"
          y="8"
          width="48"
          height="64"
          rx="4"
          stroke="var(--bg-border)"
          strokeWidth="1.5"
          transform="rotate(-6 28 8)"
        />
        <rect
          x="36"
          y="4"
          width="48"
          height="64"
          rx="4"
          stroke="var(--bg-border)"
          strokeWidth="1.5"
          transform="rotate(2 36 4)"
        />
        <rect
          x="32"
          y="12"
          width="48"
          height="64"
          rx="4"
          stroke="var(--bg-border)"
          strokeWidth="1.5"
          transform="rotate(-1 32 12)"
        />
        {/* Small lines suggesting text */}
        <line
          x1="42"
          y1="28"
          x2="70"
          y2="28"
          stroke="var(--bg-border)"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="42"
          y1="34"
          x2="65"
          y2="34"
          stroke="var(--bg-border)"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="42"
          y1="40"
          x2="68"
          y2="40"
          stroke="var(--bg-border)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      {/* Text */}
      <div className="flex flex-col items-center gap-2">
        <h2
          className="font-display text-[18px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Ask anything about your documents
        </h2>
        <p
          className="font-mono text-[12px]"
          style={{ color: "var(--text-muted)" }}
        >
          3 documents indexed
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-lg border px-3 py-2 font-body text-[13px] transition-all duration-150"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--bg-border)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.4)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.backgroundColor = "var(--bg-raised)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--bg-border)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
