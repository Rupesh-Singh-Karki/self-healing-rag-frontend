"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  onSelectMessage: (message: Message) => void;
}

export default function ChatWindow({
  messages,
  isStreaming,
  onSelectMessage,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    messages,
    messages.length > 0 ? messages[messages.length - 1].content : "",
  ]);

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 py-6">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="flex flex-col gap-8">
          {messages.map((message, index) => (
            <div key={message.id}>
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
          ))}
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
