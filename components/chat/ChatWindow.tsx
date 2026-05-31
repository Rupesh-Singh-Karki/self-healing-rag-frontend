"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";
import EmptyState from "@/components/ui/EmptyState";

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  onSelectMessage: (message: Message) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export default function ChatWindow({
  messages,
  isStreaming,
  onSelectMessage,
  onSuggestionClick,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages.length > 0 ? messages[messages.length - 1].content : ""]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-6">
        <EmptyState onSuggestionClick={onSuggestionClick} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6"
    >
      {messages.map((message, index) => {
        // Check if previous message is from same role to reduce gap
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const sameRoleAsPrev = prevMessage?.role === message.role;

        return (
          <div
            key={message.id}
            className={sameRoleAsPrev ? "-mt-3" : ""}
          >
            <MessageBubble
              message={message}
              isStreaming={
                isStreaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
              onSelect={() => {
                if (message.role === "assistant") {
                  onSelectMessage(message);
                }
              }}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
