"use client";

import { useRef, useCallback } from "react";
import { Plus, ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isStreaming: boolean;
  value: string;
  onChange: (value: string) => void;
  onUploadClick?: () => void;
  showHint?: boolean;
}

export default function ChatInput({
  onSubmit,
  isStreaming,
  value,
  onChange,
  onUploadClick,
  showHint = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = value.trim().length > 0 && !isStreaming;

  const handleSubmit = useCallback(() => {
    if (!canSend) return;
    onSubmit(value.trim());
    onChange("");
  }, [canSend, value, onSubmit, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-shrink-0 px-6 pt-3 pb-6">
      <div className="mx-auto w-full max-w-[720px]">
        {/* Single-line input bar */}
        <div
          className="flex h-12 items-center rounded-xl border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--bg-border)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Upload / Plus button */}
          {onUploadClick && (
            <button
              type="button"
              onClick={onUploadClick}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-l-xl transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-raised)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              aria-label="Upload documents"
            >
              <Plus size={18} strokeWidth={1.5} />
            </button>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-w-0 flex-1 border-none bg-transparent font-body text-[14px] outline-none"
            style={{
              color: "var(--text-primary)",
              paddingLeft: onUploadClick ? "0" : "16px",
              paddingRight: "0",
            }}
            disabled={isStreaming}
            aria-label="Message input"
            id="chat-input"
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150"
            style={{
              backgroundColor: canSend
                ? "var(--accent)"
                : "var(--bg-border)",
              marginRight: "8px",
            }}
            aria-label={
              isStreaming ? "Generating response" : "Send message"
            }
            id="send-button"
          >
            {isStreaming ? (
              <Loader2
                size={16}
                strokeWidth={1.5}
                className="animate-spin"
                style={{ color: "var(--accent)" }}
              />
            ) : (
              <ArrowUp
                size={16}
                strokeWidth={1.5}
                style={{
                  color: canSend
                    ? "var(--bg-root)"
                    : "var(--text-muted)",
                }}
              />
            )}
          </button>
        </div>

        {/* Hint text */}
        {showHint && (
          <p
            className="mt-2 text-center font-body text-[12px]"
            style={{ color: "var(--text-muted)" }}
          >
            Eidos retrieves, evaluates, and only answers when confident.
          </p>
        )}
      </div>
    </div>
  );
}
