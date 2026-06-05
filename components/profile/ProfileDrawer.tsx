"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store";
import { useGetMyProfileQuery } from "@/store/api/profileApi";
import { useListDocumentsQuery, useDeleteDocumentMutation } from "@/store/api/documentsApi";
import DocRow from "./DocRow";
import PipelineDocumentation from "./PipelineDocumentation";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "overview" | "documents" | "pipeline";
}

export default function ProfileDrawer({
  isOpen,
  onClose,
  initialTab = "overview",
}: ProfileDrawerProps) {
  const shouldReduceMotion = useReducedMotion();
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "pipeline">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync initial tab when drawer re-opens
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    setActiveTab(initialTab);
    setPrevOpen(true);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  // API queries
  const { data: profileData } = useGetMyProfileQuery(undefined, {
    skip: !isOpen,
  });
  const { data: docsData } = useListDocumentsQuery(
    searchQuery ? { search: searchQuery } : undefined,
    { skip: !isOpen }
  );
  const [deleteDocument] = useDeleteDocumentMutation();

  const analytics = profileData?.analytics;

  const filteredDocs = useMemo(() => {
    const docs = docsData?.documents ?? [];
    return docs.filter((d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [docsData?.documents, searchQuery]);

  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteDocument(id).unwrap();
    } catch {
      // Error handling could show a toast
    }
  };

  const easing = [0.32, 0.72, 0, 1] as const;

  const joinedDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  const approved = analytics?.approvedAnswers ?? 0;
  const retried = analytics?.retriedAnswers ?? 0;
  const refused = analytics?.refusedAnswers ?? 0;
  const total = approved + retried + refused;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--bg-border)",
            }}
            initial={{ x: shouldReduceMotion ? 0 : 480 }}
            animate={{ x: 0 }}
            exit={{ x: shouldReduceMotion ? 0 : 480 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.28,
              ease: [...easing],
            }}
          >
            {/* Header */}
            <div
              className="flex h-14 flex-shrink-0 items-center justify-between border-b px-6"
              style={{ borderColor: "var(--bg-border)" }}
            >
              <h2
                className="font-display text-[16px] font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded transition-colors duration-150"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                aria-label="Close profile drawer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Tab Bar */}
            <div
              className="flex flex-shrink-0 border-b px-6"
              style={{ borderColor: "var(--bg-border)" }}
            >
              {(["overview", "documents", "pipeline"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="-mb-px mr-6 h-11 cursor-pointer border-b-2 px-1 font-body text-[13px] transition-colors duration-150"
                  style={{
                    borderColor:
                      activeTab === tab ? "var(--accent)" : "transparent",
                    color:
                      activeTab === tab
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  {tab === "overview" ? "Overview" : tab === "documents" ? "Documents" : "Pipeline"}
                </button>
              ))}
            </div>

            {/* Tab Content — both mounted, toggled via display */}
            <div className="flex-1 overflow-y-auto">
              {/* Overview Tab */}
              <div style={{ display: activeTab === "overview" ? "block" : "none" }}>
                {/* Profile Info */}
                <div
                  className="border-b px-6 pt-6 pb-5"
                  style={{ borderColor: "var(--bg-border)" }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl font-mono text-xl font-medium"
                    style={{
                      backgroundColor: "var(--accent-dim)",
                      color: "var(--accent)",
                    }}
                  >
                    {user?.avatarInitials ?? "??"}
                  </div>
                  <h3
                    className="mt-4 font-display text-[22px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.fullName ?? "User"}
                  </h3>
                  <p
                    className="mt-0.5 font-body text-[14px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {user?.email ?? ""}
                  </p>
                  <p
                    className="mt-1 font-mono text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {joinedDate ? `Member since ${joinedDate}` : ""}
                  </p>
                </div>

                {/* Analytics */}
                {analytics && (
                  <>
                    <div
                      className="border-b px-6 py-5"
                      style={{ borderColor: "var(--bg-border)" }}
                    >
                      <p
                        className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Usage
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: analytics.totalSessions, label: "Total sessions" },
                          { value: analytics.totalQueries, label: "Total queries" },
                          { value: approved, label: "Approved answers" },
                          { value: retried, label: "Retried answers" },
                          { value: refused, label: "Refused answers" },
                          { value: analytics.docsIndexed, label: "Docs indexed" },
                        ].map(({ value, label }) => (
                          <div
                            key={label}
                            className="rounded-xl border p-4"
                            style={{
                              backgroundColor: "var(--bg-raised)",
                              borderColor: "var(--bg-border)",
                            }}
                          >
                            <p
                              className="font-display text-[24px] font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {value}
                            </p>
                            <p
                              className="mt-1 font-body text-[12px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Breakdown */}
                    <div className="px-6 py-5">
                      <p
                        className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Avg. confidence
                      </p>
                      <p
                        className="font-display text-[36px] font-semibold"
                        style={{ color: "var(--status-ok)" }}
                      >
                        {Math.round(analytics.avgConfidence * 100)}%
                      </p>
                      <p
                        className="font-body text-[13px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        across all sessions
                      </p>

                      {/* Breakdown bar */}
                      {total > 0 && (
                        <>
                          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="rounded-l-full"
                              style={{
                                width: `${(approved / total) * 100}%`,
                                backgroundColor: "var(--status-ok)",
                              }}
                            />
                            <div
                              style={{
                                width: `${(retried / total) * 100}%`,
                                backgroundColor: "var(--status-warn)",
                              }}
                            />
                            <div
                              className="rounded-r-full"
                              style={{
                                width: `${(refused / total) * 100}%`,
                                backgroundColor: "var(--status-fail)",
                              }}
                            />
                          </div>

                          {/* Legend */}
                          <div className="mt-3 flex items-center gap-4">
                            {[
                              { label: "Approved", color: "var(--status-ok)" },
                              { label: "Retried", color: "var(--status-warn)" },
                              { label: "Refused", color: "var(--status-fail)" },
                            ].map(({ label, color }) => (
                              <div
                                key={label}
                                className="flex items-center gap-1.5 font-mono text-[11px]"
                                style={{ color: "var(--text-muted)" }}
                              >
                                <span
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {label}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Documents Tab */}
              <div style={{ display: activeTab === "documents" ? "block" : "none" }}>
                {/* Header */}
                <div className="px-6 pt-5 pb-3">
                  <h3
                    className="font-display text-[16px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {docsData?.totalDocuments ?? 0} documents indexed
                  </h3>
                  <p
                    className="mt-0.5 font-mono text-[12px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {docsData?.totalChunks ?? 0} total chunks
                  </p>
                </div>

                {/* Search */}
                <div className="px-6 pb-4">
                  <div
                    className="flex h-9 items-center gap-2 rounded-lg border px-3"
                    style={{
                      backgroundColor: "var(--bg-raised)",
                      borderColor: "var(--bg-border)",
                    }}
                  >
                    <Search
                      size={14}
                      strokeWidth={1.5}
                      style={{ color: "var(--text-muted)" }}
                      className="flex-shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-none bg-transparent font-body text-[13px] outline-none"
                      style={{ color: "var(--text-primary)", boxShadow: "none" }}
                    />
                  </div>
                </div>

                {/* Doc list */}
                <div className="px-6">
                  <AnimatePresence>
                    {filteredDocs.map((doc) => (
                      <DocRow
                        key={doc.id}
                        id={doc.id}
                        name={doc.name}
                        size={doc.size}
                        pages={doc.pages}
                        chunks={doc.chunks}
                        uploadedAt={doc.uploadedAt}
                        onDelete={handleDeleteDoc}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredDocs.length === 0 && (
                    <p
                      className="py-8 text-center font-body text-[13px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No documents found
                    </p>
                  )}
                </div>
              </div>

              {/* Pipeline Tab */}
              <div style={{ display: activeTab === "pipeline" ? "block" : "none" }}>
                <PipelineDocumentation />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
