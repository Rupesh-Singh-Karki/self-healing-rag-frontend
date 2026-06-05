"use client";

import { useEffect, useRef } from "react";
import { UserCircle, FolderOpen, LogOut, Network } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCredentials } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: (tab?: "overview" | "documents" | "pipeline") => void;
}

export default function ProfileMenu({
  isOpen,
  onClose,
  onOpenProfile,
}: ProfileMenuProps) {
  const shouldReduceMotion = useReducedMotion();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Backend logout is best-effort; client discards token regardless
    }
    dispatch(clearCredentials());
    router.replace("/login");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="absolute bottom-[72px] left-3 right-3 z-50 overflow-hidden rounded-xl border shadow-xl"
          style={{
            backgroundColor: "var(--bg-raised)",
            borderColor: "var(--bg-border)",
          }}
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: 8, scale: 0.96 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 8, scale: 0.96 }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 0.15,
            ease: "easeOut",
          }}
        >
          {/* Header */}
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: "var(--bg-border)" }}
          >
            <p
              className="font-body text-[13px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.fullName}
            </p>
            <p
              className="font-body text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              {user?.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <MenuButton
              icon={UserCircle}
              label="My profile"
              onClick={() => {
                onClose();
                onOpenProfile("overview");
              }}
            />
            <MenuButton
              icon={FolderOpen}
              label="My documents"
              onClick={() => {
                onClose();
                onOpenProfile("documents");
              }}
            />
            <MenuButton
              icon={Network}
              label="Pipeline documentation"
              onClick={() => {
                onClose();
                onOpenProfile("pipeline");
              }}
            />
          </div>

          {/* Divider */}
          <div
            className="border-t"
            style={{ borderColor: "var(--bg-border)" }}
          />

          {/* Sign out */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-full items-center gap-3 px-4 font-body text-[13px] transition-colors duration-100"
              style={{ color: "var(--status-fail)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-surface)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <LogOut size={15} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center gap-3 px-4 font-body text-[13px] transition-colors duration-100"
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
      <Icon size={15} strokeWidth={1.5} />
      {label}
    </button>
  );
}
