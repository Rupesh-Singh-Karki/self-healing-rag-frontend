"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { SquarePen, Upload } from "lucide-react";
import { useListSessionsQuery, useRenameSessionMutation, useDeleteSessionMutation } from "@/store/api/sessionsApi";
import SessionItem from "@/components/sidebar/SessionItem";
import ProfileCard from "@/components/sidebar/ProfileCard";
import ProfileMenu from "@/components/sidebar/ProfileMenu";
import ProfileDrawer from "@/components/profile/ProfileDrawer";

interface SidebarProps {
  onUploadClick: () => void;
}

interface SessionData {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

// Group sessions by date bucket
function groupSessions(
  sessions: SessionData[]
): { label: string; items: SessionData[] }[] {
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;

  const today: SessionData[] = [];
  const yesterday: SessionData[] = [];
  const thisWeek: SessionData[] = [];
  const older: SessionData[] = [];

  for (const session of sessions) {
    const diff = now - new Date(session.timestamp).getTime();
    if (diff < oneDay) {
      today.push(session);
    } else if (diff < oneDay * 2) {
      yesterday.push(session);
    } else if (diff < oneDay * 7) {
      thisWeek.push(session);
    } else {
      older.push(session);
    }
  }

  const groups: { label: string; items: SessionData[] }[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
  if (thisWeek.length > 0) groups.push({ label: "This week", items: thisWeek });
  if (older.length > 0) groups.push({ label: "Older", items: older });

  return groups;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"overview" | "documents" | "pipeline">(
    "overview"
  );

  const { data: sessionsData, isLoading: sessionsLoading } = useListSessionsQuery();
  const [renameSession] = useRenameSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();

  const sessions = sessionsData?.sessions ?? [];
  const groups = groupSessions(sessions);

  // Extract session ID from pathname
  const activeSessionId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  const handleOpenProfile = (tab: "overview" | "documents" | "pipeline" = "overview") => {
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const handleRenameSession = async (id: string, title: string) => {
    try {
      await renameSession({ sessionId: id, title }).unwrap();
    } catch {
      // Error handling could show a toast
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id).unwrap();
      // If we deleted the active session, navigate to landing
      if (activeSessionId === id) {
        router.push("/chat");
      }
    } catch {
      // Error handling could show a toast
    }
  };

  return (
    <>
      <div
        className="flex h-[100dvh] w-[240px] flex-shrink-0 flex-col border-r"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--bg-border)",
        }}
      >
        {/* Logo Area */}
        <div
          className="flex h-14 flex-shrink-0 items-center gap-2.5 border-b px-4"
          style={{ borderColor: "var(--bg-border)" }}
        >
          <Image
            src="/logo.png"
            alt="Eidos Logo"
            width={24}
            height={24}
            className="rounded-sm object-contain"
          />
          <span
            className="font-display text-[16px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Eidos
          </span>
        </div>

        {/* New Chat Button */}
        <div className="mx-3 mt-3 mb-2">
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="flex h-9 w-full items-center gap-2 rounded-lg border px-3 font-body text-sm transition-all duration-150"
            style={{
              borderColor: "var(--bg-border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-raised)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <SquarePen
              size={15}
              strokeWidth={1.5}
              style={{ color: "var(--text-muted)" }}
            />
            New chat
          </button>
        </div>

        {/* Session Groups */}
        <div className="flex-1 overflow-y-auto">
          {sessionsLoading ? (
            <div className="flex h-full items-center justify-center">
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            <>
              {groups.map((group) => (
                <div key={group.label}>
                  <p
                    className="px-4 pt-4 pb-1 font-mono text-[10px] uppercase tracking-[0.1em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group.label}
                  </p>
                  {group.items.map((session) => (
                    <SessionItem
                      key={session.id}
                      id={session.id}
                      title={session.title}
                      lastMessage={session.lastMessage}
                      isActive={activeSessionId === session.id}
                      onClick={() => router.push(`/chat/${session.id}`)}
                      onRename={(newTitle) => handleRenameSession(session.id, newTitle)}
                      onDelete={() => handleDeleteSession(session.id)}
                    />
                  ))}
                </div>
              ))}
              {sessions.length === 0 && (
                <p
                  className="px-4 py-8 text-center font-body text-[13px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  No conversations yet
                </p>
              )}
            </>
          )}
        </div>

        {/* Upload Button */}
        <div className="mx-3 mb-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 font-body text-sm transition-all duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-raised)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Upload size={15} strokeWidth={1.5} />
            Upload documents
          </button>
        </div>

        {/* Profile Card + Menu */}
        <div className="relative">
          <ProfileMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpenProfile={handleOpenProfile}
          />
          <ProfileCard onClick={() => setMenuOpen(!menuOpen)} />
        </div>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialTab={drawerTab}
      />
    </>
  );
}
