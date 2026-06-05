"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store";
import Sidebar from "@/components/layout/Sidebar";
import UploadDrawer from "@/components/upload/UploadDrawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { token, isHydrated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || !token) return null;

  const easing = [0.32, 0.72, 0, 1] as const;

  return (
    <div
      className="flex h-[100dvh]"
      style={{ backgroundColor: "var(--bg-root)" }}
    >
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block">
        <Sidebar onUploadClick={() => setUploadOpen(true)} />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="fixed left-0 top-0 z-50 lg:hidden"
              initial={{ x: shouldReduceMotion ? 0 : -240 }}
              animate={{ x: 0 }}
              exit={{ x: shouldReduceMotion ? 0 : -240 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
                ease: [...easing],
              }}
            >
              <Sidebar onUploadClick={() => {
                setMobileSidebarOpen(false);
                setUploadOpen(true);
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile menu button */}
        <div className="flex h-10 flex-shrink-0 items-center px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-raised)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label="Open sidebar"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>

        {children}
      </div>

      {/* Upload Drawer */}
      <UploadDrawer
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
}
