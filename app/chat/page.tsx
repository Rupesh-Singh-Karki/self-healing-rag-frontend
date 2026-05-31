"use client";

import { useState, useCallback } from "react";
import { Layers, ScanEye, GitBranch } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Message } from "@/types";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { useSSEStream } from "@/hooks/useSSEStream";

import Header from "@/components/layout/Header";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import SourcesPanel from "@/components/panels/SourcesPanel";
import CriticPanel from "@/components/panels/CriticPanel";
import TracePanel from "@/components/panels/TracePanel";
import UploadDrawer from "@/components/upload/UploadDrawer";

type MobilePanel = "sources" | "critic" | "trace" | null;

export default function ChatPage() {
  const shouldReduceMotion = useReducedMotion();

  // State
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(
    // Default to the last assistant message
    MOCK_MESSAGES.filter((m) => m.role === "assistant").pop() ?? null
  );
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  // Streaming
  const stream = useSSEStream();

  // Select an assistant message to show its details in panels
  const handleSelectMessage = useCallback((message: Message) => {
    setSelectedMessage(message);
  }, []);

  // Submit a new question
  const handleSubmit = useCallback(
    (content: string) => {
      const userMsg: Message = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        sources: [],
        critic: null as unknown as undefined,
        trace: [],
        retries: 0,
        final_status: "in_progress",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setSelectedMessage(assistantMsg);

      // Start streaming
      stream.ask(content);
    },
    [stream]
  );

  // Update the streaming assistant message with live data
  const lastMessage = messages[messages.length - 1];
  const isStreaming = stream.status === "streaming";

  // Build the "live" version of the last assistant message if streaming
  const liveMessages = messages.map((msg) => {
    if (
      msg.id === lastMessage?.id &&
      lastMessage?.role === "assistant" &&
      (stream.status === "streaming" || stream.status === "done")
    ) {
      const isRefused =
        stream.status === "done" &&
        stream.trace.some((t) => t.node === "refuse" && t.status === "done");

      return {
        ...msg,
        content: stream.answer || msg.content,
        sources: stream.chunks.length > 0 ? stream.chunks : msg.sources,
        critic: stream.critic ?? msg.critic,
        trace: stream.trace.length > 0 ? stream.trace : msg.trace,
        retries: stream.trace.filter((t) => t.node === "rewrite").length,
        final_status:
          stream.status === "done"
            ? isRefused
              ? ("refused" as const)
              : ("returned" as const)
            : ("in_progress" as const),
      };
    }
    return msg;
  });

  // Determine which data to show in panels
  const panelMessage =
    selectedMessage?.id === lastMessage?.id && isStreaming
      ? liveMessages[liveMessages.length - 1]
      : selectedMessage
        ? liveMessages.find((m) => m.id === selectedMessage.id) ??
          selectedMessage
        : null;

  const panelChunks = panelMessage?.sources ?? [];
  const panelCritic = panelMessage?.critic ?? null;
  const panelTrace = panelMessage?.trace ?? [];

  // Suggestion click handler
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInputValue(suggestion);
    },
    []
  );

  // Mobile panel toggle
  const toggleMobilePanel = (panel: MobilePanel) => {
    setMobilePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="flex h-[100dvh] flex-col" style={{ backgroundColor: "var(--bg-root)" }}>
      <Header
        onUploadClick={() => setUploadOpen(true)}
        documentCount={3}
      />

      <div className="flex min-h-0 flex-1">
        {/* ── Left Column — Chat ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatWindow
            messages={liveMessages}
            isStreaming={isStreaming}
            onSelectMessage={handleSelectMessage}
            onSuggestionClick={handleSuggestionClick}
          />
          <ChatInput
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
            value={inputValue}
            onChange={setInputValue}
          />

          {/* Mobile panel tabs — visible below lg */}
          <div
            className="flex border-t lg:hidden"
            style={{ borderColor: "var(--bg-border)" }}
          >
            <MobilePanelTab
              icon={Layers}
              label="Sources"
              active={mobilePanel === "sources"}
              onClick={() => toggleMobilePanel("sources")}
            />
            <MobilePanelTab
              icon={ScanEye}
              label="Critic"
              active={mobilePanel === "critic"}
              onClick={() => toggleMobilePanel("critic")}
            />
            <MobilePanelTab
              icon={GitBranch}
              label="Trace"
              active={mobilePanel === "trace"}
              onClick={() => toggleMobilePanel("trace")}
            />
          </div>
        </div>

        {/* ── Right Sidebar — Desktop ── */}
        <aside
          className="hidden w-[380px] flex-shrink-0 flex-col gap-6 overflow-y-auto border-l p-5 lg:flex"
          style={{
            borderColor: "var(--bg-border)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <SourcesPanel chunks={panelChunks} />
          <div
            className="border-t"
            style={{ borderColor: "var(--bg-border)" }}
          />
          <CriticPanel critic={panelCritic} />
          <div
            className="border-t"
            style={{ borderColor: "var(--bg-border)" }}
          />
          <TracePanel
            trace={panelTrace}
            activeNode={
              selectedMessage?.id === lastMessage?.id
                ? stream.activeNode
                : null
            }
          />
        </aside>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      <AnimatePresence>
        {mobilePanel && (
          <>
            <motion.div
              className="fixed inset-0 z-30 lg:hidden"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
              onClick={() => setMobilePanel(null)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-40 overflow-y-auto rounded-t-xl border-t p-5 lg:hidden"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--bg-border)",
                maxHeight: "60vh",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {/* Drag handle */}
              <div className="mb-4 flex justify-center">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: "var(--bg-border)" }}
                />
              </div>
              {mobilePanel === "sources" && (
                <SourcesPanel chunks={panelChunks} />
              )}
              {mobilePanel === "critic" && (
                <CriticPanel critic={panelCritic} />
              )}
              {mobilePanel === "trace" && (
                <TracePanel
                  trace={panelTrace}
                  activeNode={
                    selectedMessage?.id === lastMessage?.id
                      ? stream.activeNode
                      : null
                  }
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Upload Drawer ── */}
      <UploadDrawer
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
}

// ── Mobile Panel Tab ──
function MobilePanelTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 py-3 font-mono text-[11px] transition-colors duration-150"
      style={{
        color: active ? "var(--accent)" : "var(--text-muted)",
        backgroundColor: active ? "var(--accent-dim)" : "transparent",
      }}
      aria-label={`Toggle ${label} panel`}
      aria-pressed={active}
    >
      <Icon size={14} strokeWidth={1.5} />
      {label}
    </button>
  );
}
