"use client";

import { useRef, useEffect, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isStreaming: boolean;
  value: string;
  onChange: (value: string) => void;
}

export default function ChatInput({
  onSubmit,
  isStreaming,
  value,
  onChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isStreaming;

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const lineHeight = 22;
    const maxHeight = lineHeight * 5 + 24; // 5 lines + padding
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    onChange("");
    // Reset height after clearing
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="flex-shrink-0 border-t px-6 py-4"
      style={{
        backgroundColor: "var(--bg-root)",
        borderColor: "var(--bg-border)",
      }}
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          rows={1}
          className="flex-1 resize-none rounded-lg border px-4 py-3 font-body text-[14px] transition-colors duration-150 focus:ring-1"
          style={
            {
              backgroundColor: "var(--bg-raised)",
              borderColor: "var(--bg-border)",
              color: "var(--text-primary)",
              "--tw-ring-color": "var(--accent)",
              outline: "none",
            } as React.CSSProperties
          }
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--bg-border)")
          }
          disabled={isStreaming}
          aria-label="Message input"
          id="chat-input"
        />

        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:ring-1"
          style={
            {
              backgroundColor: canSend
                ? "var(--accent)"
                : "var(--bg-border)",
              "--tw-ring-color": "var(--accent)",
            } as React.CSSProperties
          }
          aria-label={isStreaming ? "Generating response" : "Send message"}
          id="send-button"
        >
          {isStreaming ? (
            <Loader2
              size={18}
              strokeWidth={1.5}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
          ) : (
            <ArrowUp
              size={18}
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
    </div>
  );
}
