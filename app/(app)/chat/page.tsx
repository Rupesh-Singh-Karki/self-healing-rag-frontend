"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import ChatInput from "@/components/chat/ChatInput";
import { useGetLandingQuery } from "@/store/api/sessionsApi";
import { useCreateSessionMutation } from "@/store/api/sessionsApi";

export default function NewChatPage() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const { data: landing } = useGetLandingQuery();
  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();

  const suggestions = landing?.suggestions ?? [
    "What are the key takeaways from my documents?",
    "Summarize the main policies mentioned in the handbook.",
    "What compliance requirements are outlined?",
    "Find information about employee benefits.",
  ];
  const docCount = landing?.indexedDocumentCount ?? 0;

  const handleSubmit = useCallback(
    async (content: string) => {
      try {
        const result = await createSession(content).unwrap();
        router.push(`/chat/${result.id}?q=${encodeURIComponent(content)}`);
      } catch {
        // Error handling could show a toast
      }
    },
    [createSession, router]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSubmit(suggestion);
    }, 100);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Centered landing */}
      <div className="flex flex-1 flex-col items-center justify-start px-6">
        <div className="w-full max-w-[680px]" style={{ marginTop: "20vh" }}>
          <h1
            className="text-center font-display text-[28px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            What do you want to know?
          </h1>
          <p
            className="mt-2 text-center font-body text-[15px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {docCount > 0
              ? `Ask anything about your ${docCount} indexed document${docCount !== 1 ? "s" : ""}.`
              : "Upload documents to get started."}
          </p>

          {/* Suggestion cards — 2×2 grid */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isCreating}
                className="group relative cursor-pointer rounded-xl border p-4 text-left transition-all duration-150 disabled:opacity-60"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--bg-border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(45, 212, 191, 0.3)";
                  e.currentTarget.style.backgroundColor = "var(--bg-raised)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--bg-border)";
                  e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                }}
              >
                <span
                  className="font-body text-[14px] transition-colors duration-150"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {suggestion}
                </span>
                <ArrowUpRight
                  size={14}
                  strokeWidth={1.5}
                  className="absolute right-3 top-3"
                  style={{ color: "var(--text-muted)" }}
                />
              </button>
            ))}
          </div>

          {/* Creating session indicator */}
          {isCreating && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Loader2
                size={16}
                strokeWidth={1.5}
                className="animate-spin"
                style={{ color: "var(--accent)" }}
              />
              <span
                className="font-body text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Creating session...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating input */}
      <ChatInput
        onSubmit={handleSubmit}
        isStreaming={isCreating}
        value={inputValue}
        onChange={setInputValue}
        showHint
      />
    </div>
  );
}
