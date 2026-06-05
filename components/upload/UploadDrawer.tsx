"use client";

import { useRef, useState, useCallback } from "react";
import { X, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useListIndexedDocumentsQuery } from "@/store/api/documentsApi";
import { useUploadDocumentMutation } from "@/store/api/documentsApi";

interface UploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadDrawer({ isOpen, onClose }: UploadDrawerProps) {
  const shouldReduceMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { data: indexedDocsData } = useListIndexedDocumentsQuery(undefined, {
    skip: !isOpen,
  });
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const indexedDocs = indexedDocsData?.documents ?? [];

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setUploadError(null);
      setUploadSuccess(null);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        try {
          await uploadDocument(formData).unwrap();
          setUploadSuccess(file.name);
          setTimeout(() => setUploadSuccess(null), 3000);
        } catch {
          setUploadError(`Failed to upload ${file.name}`);
        }
      }
    },
    [uploadDocument]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
    },
    [handleFiles]
  );

  const easing = [0.32, 0.72, 0, 1] as const;

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
            className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-full flex-col border-l"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--bg-border)",
            }}
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: [...easing],
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--bg-border)" }}>
              <h2
                className="font-display text-[16px] font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Upload Documents
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded transition-colors duration-150"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
                aria-label="Close upload drawer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Drop zone */}
            <div className="px-6 py-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-150 disabled:opacity-60"
                style={{
                  borderColor: isDragOver
                    ? "var(--accent)"
                    : "var(--bg-border)",
                  backgroundColor: isDragOver
                    ? "rgba(45, 212, 191, 0.05)"
                    : "transparent",
                }}
              >
                {isUploading ? (
                  <Loader2
                    size={32}
                    strokeWidth={1.5}
                    className="animate-spin"
                    style={{ color: "var(--accent)" }}
                  />
                ) : (
                  <Upload
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="font-body text-[14px]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isUploading ? "Uploading..." : "Drop files here"}
                  </span>
                  <span
                    className="font-body text-[13px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    PDF, TXT, CSV, JSON, MD, DOCX
                  </span>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.json,.md,.docx"
                className="hidden"
                multiple
                onChange={handleFileInputChange}
                aria-hidden="true"
              />

              {/* Upload feedback */}
              {uploadSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(74, 222, 128, 0.1)" }}>
                  <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: "var(--status-ok)" }} />
                  <span className="font-body text-[13px]" style={{ color: "var(--status-ok)" }}>
                    {uploadSuccess} uploaded
                  </span>
                </div>
              )}
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(248, 113, 113, 0.1)" }}>
                  <span className="font-body text-[13px]" style={{ color: "var(--status-fail)" }}>
                    {uploadError}
                  </span>
                </div>
              )}
            </div>

            {/* Indexed documents list */}
            <div className="flex-1 overflow-y-auto px-6">
              <h3
                className="mb-3 font-display text-[12px] uppercase tracking-[0.1em]"
                style={{ color: "var(--text-muted)" }}
              >
                Indexed Documents
              </h3>

              <div className="flex flex-col gap-1">
                {indexedDocs.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--bg-raised)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText
                        size={16}
                        strokeWidth={1.5}
                        className="flex-shrink-0"
                        style={{ color: "var(--accent)" }}
                      />
                      <span
                        className="truncate font-body text-[13px]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {doc.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {doc.chunks} chunks
                      </span>
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            doc.status === "indexed"
                              ? "var(--status-ok)"
                              : "var(--status-warn)",
                        }}
                      />
                    </div>
                  </div>
                ))}
                {indexedDocs.length === 0 && (
                  <p
                    className="py-6 text-center font-body text-[13px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No indexed documents yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
