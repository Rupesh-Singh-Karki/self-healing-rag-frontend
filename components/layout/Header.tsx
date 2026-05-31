"use client";

import { Upload } from "lucide-react";

interface HeaderProps {
  onUploadClick: () => void;
  documentCount?: number;
}

export default function Header({
  onUploadClick,
  documentCount = 3,
}: HeaderProps) {
  return (
    <header
      className="flex h-14 flex-shrink-0 items-center justify-between border-b px-6"
      style={{
        backgroundColor: "var(--bg-root)",
        borderColor: "var(--bg-border)",
      }}
    >
      {/* Left — Logo + Branding */}
      <div className="flex items-center gap-3">
        {/* Geometric logo mark */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="3"
            stroke="var(--accent)"
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="6"
            y="6"
            width="12"
            height="12"
            rx="2"
            stroke="var(--accent)"
            strokeWidth="1.5"
            fill="var(--accent)"
            fillOpacity="0.15"
          />
          <rect
            x="9"
            y="9"
            width="6"
            height="6"
            rx="1"
            fill="var(--accent)"
          />
        </svg>

        <div className="flex flex-col">
          <span
            className="font-display text-[16px] font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Eidos
          </span>
          <span
            className="font-mono text-[10px] uppercase leading-tight tracking-[0.08em]"
            style={{ color: "var(--text-muted)" }}
          >
            document intelligence
          </span>
        </div>
      </div>

      {/* Right — Doc count + Upload */}
      <div className="flex items-center gap-4">
        {/* Document count pill */}
        <span
          className="rounded border px-2.5 py-0.5 font-mono text-[11px]"
          style={{
            color: "var(--text-secondary)",
            borderColor: "var(--bg-border)",
          }}
        >
          {documentCount} docs indexed
        </span>

        {/* Upload button */}
        <button
          onClick={onUploadClick}
          className="flex min-h-[44px] items-center gap-1.5 font-body text-[13px] transition-colors duration-150 focus-visible:ring-1"
          style={
            {
              color: "var(--text-secondary)",
              "--tw-ring-color": "var(--accent)",
            } as React.CSSProperties
          }
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
          aria-label="Upload documents"
        >
          <Upload size={16} strokeWidth={1.5} />
          Upload
        </button>
      </div>
    </header>
  );
}
