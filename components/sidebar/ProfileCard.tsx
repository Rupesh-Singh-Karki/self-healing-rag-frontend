"use client";

import { ChevronsUpDown } from "lucide-react";
import { useAppSelector } from "@/store";

interface ProfileCardProps {
  onClick: () => void;
}

export default function ProfileCard({ onClick }: ProfileCardProps) {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div
      className="border-t p-3"
      style={{ borderColor: "var(--bg-border)" }}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150"
        style={{ backgroundColor: "transparent" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--bg-raised)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        {/* Avatar */}
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-medium"
          style={{
            backgroundColor: "var(--accent-dim)",
            color: "var(--accent)",
          }}
        >
          {user?.avatarInitials ?? "??"}
        </div>

        {/* Name + Email */}
        <div className="min-w-0 flex-1 text-left">
          <p
            className="truncate font-body text-[13px] font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.fullName ?? "User"}
          </p>
          <p
            className="truncate font-body text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {user?.email ?? ""}
          </p>
        </div>

        {/* Chevrons */}
        <ChevronsUpDown
          size={14}
          strokeWidth={1.5}
          className="flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
        />
      </button>
    </div>
  );
}
