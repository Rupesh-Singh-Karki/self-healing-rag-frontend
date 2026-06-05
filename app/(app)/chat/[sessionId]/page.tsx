"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Layers, ScanEye, GitBranch, PanelRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Message } from "@/types";
import { useGetSessionMessagesQuery } from "@/store/api/sessionsApi";
import { useAppSelector, useAppDispatch } from "@/store";
import { setMessages, clearMessages } from "@/store/slices/chatSlice";
import { sendMessage } from "@/store/thunks/sendMessage";

import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import SourcesPanel from "@/components/panels/SourcesPanel";
import CriticPanel from "@/components/panels/CriticPanel";
import TracePanel from "@/components/panels/TracePanel";

type MobilePanel = "sources" | "critic" | "trace" | null;

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const shouldReduceMotion = useReducedMotion();
  const sessionId = params.sessionId as string;

  const initialQ = searchParams.get("q");

  useEffect(() => {
    if (initialQ) {
      dispatch(sendMessage({ sessionId, content: initialQ }));
      router.replace(`/chat/${sessionId}`);
    }
  }, [initialQ, dispatch, sessionId, router]);

  // Fetch session messages from API
  const { data: sessionData, isLoading: messagesLoading } = useGetSessionMessagesQuery(sessionId, {
    refetchOnMountOrArgChange: true,
  });

  // Redux chat state
  const chatState = useAppSelector((state) => state.chat);

  // Local UI state
  const [inputValue, setInputValue] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  // Load messages from API into Redux
  useEffect(() => {
    if (sessionData?.messages) {
      const mapped = sessionData.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.timestamp,
        sources: m.sources ?? undefined,
        critic: m.critic ?? undefined,
        trace: m.trace?.map((t) => ({
          node: t.node as "retrieve" | "generate" | "critic" | "rewrite" | "refuse",
          status: t.status as "started" | "done",
        })) ?? undefined,
        retries: m.retries ?? undefined,
        final_status: (m.final_status as "returned" | "refused" | "retried" | null) ?? undefined,
      }));
      dispatch(setMessages(mapped));

      // Auto-select the last assistant message
      const lastAssistant = [...mapped].reverse().find((m) => m.role === "assistant");
      if (lastAssistant) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedMessageId(lastAssistant.id);
      }
    }

    return () => {
      dispatch(clearMessages());
    };
  }, [sessionData, dispatch]);

  const isStreaming = chatState.streamStatus === "streaming";

  // Build the live messages list, overlaying streaming data onto the last assistant message
  const liveMessages: Message[] = useMemo(() => {
    return chatState.messages.map((msg, index) => {
      const isLast = index === chatState.messages.length - 1;

      if (
        isLast &&
        msg.role === "assistant" &&
        (chatState.streamStatus === "streaming" || chatState.streamStatus === "done") &&
        msg.final_status === "in_progress"
      ) {
        const isRefused =
          chatState.streamStatus === "done" &&
          chatState.streamingTrace.some(
            (t) => t.node === "refuse" && t.status === "done"
          );

        return {
          id: msg.id,
          role: msg.role,
          content: chatState.streamingAnswer || msg.content,
          timestamp: new Date(msg.timestamp),
          sources: chatState.streamingChunks.length > 0 ? chatState.streamingChunks : msg.sources,
          critic: chatState.streamingCritic ?? msg.critic ?? undefined,
          trace: chatState.streamingTrace.length > 0 ? chatState.streamingTrace : msg.trace,
          retries: chatState.streamingTrace.filter((t) => t.node === "rewrite").length,
          final_status: chatState.streamStatus === "done"
            ? isRefused
              ? ("refused" as const)
              : ("returned" as const)
            : ("in_progress" as const),
        };
      }

      return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        sources: msg.sources,
        critic: msg.critic ?? undefined,
        trace: msg.trace,
        retries: msg.retries,
        final_status: msg.final_status ?? undefined,
      };
    });
  }, [chatState]);

  const handleSelectMessage = useCallback((message: Message) => {
    setSelectedMessageId(message.id);
  }, []);

  const handleSubmit = useCallback(
    (content: string) => {
      dispatch(sendMessage({ sessionId, content }));
      setSelectedMessageId(`msg-${Date.now()}-assistant`);
    },
    [dispatch, sessionId]
  );

  const lastMessage = liveMessages[liveMessages.length - 1];

  const selectedMessage = selectedMessageId
    ? liveMessages.find((m) => m.id === selectedMessageId) ?? null
    : null;

  const panelMessage =
    selectedMessage?.id === lastMessage?.id && isStreaming
      ? lastMessage
      : selectedMessage;

  const panelChunks = panelMessage?.sources ?? [];
  const panelCritic = panelMessage?.critic ?? null;
  const panelTrace = panelMessage?.trace ?? [];

  const hasAssistantMessage = liveMessages.some(
    (m) => m.role === "assistant"
  );
  const showRightPanel = rightPanelVisible && hasAssistantMessage;

  const toggleMobilePanel = (panel: MobilePanel) => {
    setMobilePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="flex min-h-0 flex-1">
      {/* Chat column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Session header bar */}
        <div
          className="flex h-10 flex-shrink-0 items-center justify-between border-b px-6"
          style={{ borderColor: "var(--bg-border)" }}
        >
          <span
            className="truncate font-body text-[14px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {sessionData?.session?.title ?? sessionId}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRightPanelVisible(!rightPanelVisible)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 lg:flex"
              style={{
                color: rightPanelVisible
                  ? "var(--accent)"
                  : "var(--text-muted)",
                backgroundColor: rightPanelVisible
                  ? "var(--accent-dim)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!rightPanelVisible) {
                  e.currentTarget.style.backgroundColor = "var(--bg-raised)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!rightPanelVisible) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
              aria-label="Toggle right panel"
              aria-pressed={rightPanelVisible}
            >
              <PanelRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Chat messages */}
        {messagesLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        ) : (
          <ChatWindow
            messages={liveMessages}
            isStreaming={isStreaming}
            onSelectMessage={handleSelectMessage}
          />
        )}

        {/* Chat input */}
        <ChatInput
          onSubmit={handleSubmit}
          isStreaming={isStreaming}
          value={inputValue}
          onChange={setInputValue}
        />

        {/* Mobile panel tabs */}
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

      {/* ── Right Panel — Desktop ── */}
      <AnimatePresence initial={false}>
        {showRightPanel && (
          <motion.aside
            className="hidden w-[340px] flex-shrink-0 flex-col gap-6 overflow-y-auto border-l p-5 lg:flex"
            style={{
              borderColor: "var(--bg-border)",
              backgroundColor: "var(--bg-surface)",
            }}
            initial={{ width: shouldReduceMotion ? 340 : 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: shouldReduceMotion ? 340 : 0, opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: [0.32, 0.72, 0, 1],
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
                selectedMessageId === lastMessage?.id
                  ? chatState.activeNode
                  : null
              }
            />
          </motion.aside>
        )}
      </AnimatePresence>

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
                    selectedMessageId === lastMessage?.id
                      ? chatState.activeNode
                      : null
                  }
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
