"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Check, X } from "lucide-react";

interface SessionItemProps {
  id: string;
  title: string;
  lastMessage: string;
  isActive: boolean;
  onClick: () => void;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
}

export default function SessionItem({
  title,
  lastMessage,
  isActive,
  onClick,
  onRename,
  onDelete,
}: SessionItemProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== title && onRename) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setRenameValue(title);
    setIsRenaming(false);
  };

  return (
    <div
      className="relative mx-1 cursor-pointer rounded-lg transition-all duration-100"
      style={{
        backgroundColor: isActive
          ? "var(--bg-raised)"
          : hovered
            ? "rgba(26, 26, 26, 0.6)"
            : "transparent",
        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
        paddingLeft: isActive ? "10px" : "12px",
      }}
      onClick={isRenaming ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMenuOpen(false);
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <div className="flex items-center gap-1">
              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit();
                  if (e.key === "Escape") handleRenameCancel();
                }}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 flex-1 rounded border bg-transparent px-1.5 py-0.5 font-body text-[13px] outline-none"
                style={{
                  color: "var(--text-primary)",
                  borderColor: "var(--accent)",
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameSubmit();
                }}
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ color: "var(--status-ok)" }}
              >
                <Check size={12} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameCancel();
                }}
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <>
              <p
                className="truncate font-body text-[13px]"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </p>
              <p
                className="truncate font-body text-[12px]"
                style={{ color: "var(--text-muted)" }}
              >
                {lastMessage}
              </p>
            </>
          )}
        </div>

        {/* More button on hover */}
        {hovered && !isRenaming && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors duration-100"
            style={{ color: "var(--text-muted)" }}
            aria-label="Session options"
          >
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Context menu popover */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-1 top-full z-50 mt-1 overflow-hidden rounded-lg border shadow-lg"
          style={{
            backgroundColor: "var(--bg-raised)",
            borderColor: "var(--bg-border)",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              setRenameValue(title);
              setIsRenaming(true);
            }}
            className="flex w-full items-center px-4 py-2 font-body text-[13px] transition-colors duration-100"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-surface)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Rename
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onDelete?.();
            }}
            className="flex w-full items-center px-4 py-2 font-body text-[13px] transition-colors duration-100"
            style={{ color: "var(--status-fail)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
