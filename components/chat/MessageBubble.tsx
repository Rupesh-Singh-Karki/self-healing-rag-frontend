"use client";

import { useState, useEffect, MouseEvent } from "react";
import { AlertCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onSelect?: () => void;
}

function TypewriterEffect({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  // Strip out JSON metadata appended to the end of the content string
  const cleanContent = content.replace(/\{"confidence".*?\}$/, '');
  const [displayedContent, setDisplayedContent] = useState(() => isStreaming ? "" : cleanContent);

  if (!isStreaming && displayedContent !== cleanContent) {
    setDisplayedContent(cleanContent);
  }

  useEffect(() => {
    if (!isStreaming) return;
    
    const diff = cleanContent.length - displayedContent.length;
    if (diff > 0) {
      const step = Math.max(1, Math.floor(diff / 4));
      const timer = setTimeout(() => {
        setDisplayedContent(prev => cleanContent.slice(0, prev.length + step));
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [cleanContent, displayedContent, isStreaming]);

  return <ReactMarkdown>{displayedContent}</ReactMarkdown>;
}

export default function MessageBubble({
  message,
  isStreaming = false,
  onSelect,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: MouseEvent) => {
    e.stopPropagation();
    // Strip JSON metadata before copying to clipboard
    const textToCopy = message.content.replace(/\{"confidence".*?\}$/, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="ml-auto max-w-[65%]">
          <div
            className="rounded-xl rounded-br-sm px-4 py-3"
            style={{ backgroundColor: "var(--bg-raised)" }}
          >
            <p
              className="font-body text-[14px]"
              style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap" }}
            >
              {message.content}
            </p>
          </div>
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
  
  // Also strip for non-streaming fast-path
  const staticCleanContent = message.content.replace(/\{"confidence".*?\}$/, '');

  return (
    <div className="flex justify-start">
      <div
        role="button"
        tabIndex={0}
        className="w-full cursor-pointer border-none bg-transparent p-0 text-left focus:outline-none"
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
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
            <div
              className="font-body w-full min-h-[24px]"
              style={{
                color: isRefused
                  ? "var(--text-secondary)"
                  : "var(--text-primary)",
              }}
            >
              {!message.content && isStreaming && message.final_status === "in_progress" ? (
                <div className="flex items-center gap-1 h-5 pt-2 ml-1 opacity-60">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-[14px] leading-relaxed dark:prose-invert" style={{ color: "inherit" }}>
                  {isStreaming ? (
                    <TypewriterEffect content={message.content} isStreaming={isStreaming} />
                  ) : (
                    <ReactMarkdown>{staticCleanContent}</ReactMarkdown>
                  )}
                  {isStreaming && message.final_status === "in_progress" && (
                    <span
                      className="ml-0.5 inline-block animate-[blink-cursor_1s_step-end_infinite]"
                      style={{ color: "var(--accent)" }}
                    >
                      |
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Meta row */}
          {message.final_status !== "in_progress" && (
            <div
              className="mt-2 flex items-center justify-between"
            >
              <div 
                className="flex items-center gap-1 font-mono text-[11px]"
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
              
              <div 
                className="flex items-center gap-3 font-mono text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <span>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-6 w-6 items-center justify-center rounded transition-colors duration-150"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-raised)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                  aria-label="Copy response"
                >
                  {copied ? <Check size={12} strokeWidth={1.5} /> : <Copy size={12} strokeWidth={1.5} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
