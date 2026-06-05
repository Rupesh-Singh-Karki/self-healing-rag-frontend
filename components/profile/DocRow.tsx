"use client";

import { useState, useCallback } from "react";
import { FileText, Download, Trash2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store";

interface DocRowProps {
  id: string;
  name: string;
  size: string;
  pages: number;
  chunks: number;
  uploadedAt: string;
  onDelete: (id: string) => void;
}

export default function DocRow({
  id,
  name,
  size,
  pages,
  chunks,
  uploadedAt,
  onDelete,
}: DocRowProps) {
  const shouldReduceMotion = useReducedMotion();
  const [downloadAnimating, setDownloadAnimating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const token = useAppSelector((state) => state.auth.token);

  const formattedDate = new Date(uploadedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDownload = useCallback(async () => {
    setDownloadAnimating(true);
    setTimeout(() => setDownloadAnimating(false), 300);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const response = await fetch(`${baseUrl}/documents/${id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Download error handling
    }
  }, [id, name, token]);

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: "auto" }}
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, height: 0 }
      }
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="overflow-hidden"
    >
      <div
        className="flex items-center gap-4 border-b py-4"
        style={{ borderColor: "var(--bg-border)" }}
      >
        {/* File icon */}
        <FileText
          size={20}
          strokeWidth={1.5}
          className="flex-shrink-0"
          style={{ color: "var(--accent)" }}
        />

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-body text-[13px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {name}
          </p>
          <p
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {pages} pages · {chunks} chunks · {size}
          </p>
          <p
            className="font-mono text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            Uploaded {formattedDate}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Download */}
          <motion.button
            type="button"
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-100"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-raised)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            animate={
              downloadAnimating && !shouldReduceMotion
                ? { scale: [1, 1.3, 1] }
                : {}
            }
            transition={{ duration: 0.2 }}
            aria-label={`Download ${name}`}
            title="Download"
          >
            <Download size={15} strokeWidth={1.5} />
          </motion.button>

          {/* Delete */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-100"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-raised)";
                e.currentTarget.style.color = "var(--status-fail)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              aria-label={`Delete ${name}`}
              title="Remove"
            >
              <Trash2 size={15} strokeWidth={1.5} />
            </button>

            {/* Delete confirmation tooltip */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.1 }}
                  className="absolute right-0 top-full z-10 mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg"
                  style={{
                    backgroundColor: "var(--bg-raised)",
                    borderColor: "var(--bg-border)",
                  }}
                >
                  <span
                    className="font-body text-[12px] whitespace-nowrap"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Remove?
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(id)}
                    className="font-body text-[12px] font-medium transition-colors duration-100"
                    style={{ color: "var(--status-fail)" }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="font-body text-[12px] font-medium transition-colors duration-100"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
