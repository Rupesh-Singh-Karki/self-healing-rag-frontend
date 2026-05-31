"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onSelect?: () => void;
}

export default function MessageBubble({
  message,
  isStreaming = false,
  onSelect,
}: MessageBubbleProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);

  if (message.role === "user") {
    return (
      <div
        className="flex justify-end"
        onMouseEnter={() => setShowTimestamp(true)}
        onMouseLeave={() => setShowTimestamp(false)}
      >
        <div className="max-w-[70%]">
          <div
            className="rounded-xl rounded-br-sm px-4 py-3"
            style={{ backgroundColor: "var(--bg-raised)" }}
          >
            <p
              className="font-body text-[14px]"
              style={{ color: "var(--text-primary)" }}
            >
              {message.content}
            </p>
          </div>
          {showTimestamp && (
            <p
              className="mt-1 text-right font-mono text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Assistant message
  const isRefused = message.final_status === "refused";
  const isRetried = (message.retries ?? 0) > 0 && !isRefused;
  const isReturned = message.final_status === "returned";

  const borderColor = isRefused
    ? "var(--status-fail)"
    : isRetried
      ? "var(--status-warn)"
      : isReturned
        ? "var(--accent)"
        : "var(--bg-border)";

  const sourcesCount = message.sources?.length ?? 0;
  const confidence = message.critic?.score;
  const retries = message.retries ?? 0;

  return (
    <div className="flex justify-start">
      <button
        type="button"
        className="max-w-[80%] cursor-pointer border-none bg-transparent p-0 text-left"
        onClick={onSelect}
        aria-label="View message details"
      >
        <div
          className="border-l-[2px] pl-4"
          style={{ borderColor }}
        >
          <div className="flex items-start gap-2">
            {isRefused && (
              <AlertCircle
                size={14}
                strokeWidth={1.5}
                className="mt-[3px] flex-shrink-0"
                style={{ color: "var(--status-fail)" }}
              />
            )}
            <p
              className="font-body text-[14px] leading-relaxed"
              style={{
                color: isRefused
                  ? "var(--text-secondary)"
                  : "var(--text-primary)",
              }}
            >
              {message.content}
              {isStreaming && message.final_status === "in_progress" && (
                <span
                  className="ml-0.5 inline-block animate-[blink-cursor_1s_step-end_infinite]"
                  style={{ color: "var(--accent)" }}
                >
                  |
                </span>
              )}
            </p>
          </div>

          {/* Meta row */}
          {message.final_status !== "in_progress" && (
            <div
              className="mt-2 flex items-center gap-1 font-mono text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {confidence !== undefined && (
                <>
                  <span>{(confidence * 100).toFixed(0)}% confidence</span>
                  <span aria-hidden="true"> · </span>
                </>
              )}
              <span>
                {retries} {retries === 1 ? "retry" : "retries"}
              </span>
              <span aria-hidden="true"> · </span>
              {isRefused ? (
                <span style={{ color: "var(--status-fail)" }}>refused</span>
              ) : (
                <span>
                  {sourcesCount} {sourcesCount === 1 ? "source" : "sources"}
                </span>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
