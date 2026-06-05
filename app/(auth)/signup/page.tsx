"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { useSignupMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";

function getStrengthLevel(len: number): number {
  if (len === 0) return 0;
  if (len <= 4) return 1;
  if (len <= 7) return 2;
  if (len <= 11) return 3;
  return 4;
}

function getBarColor(barIndex: number, level: number): string {
  if (barIndex >= level) return "var(--bg-border)";
  switch (level) {
    case 1:
      return "var(--status-fail)";
    case 2:
      return "var(--status-warn)";
    case 3:
      return "var(--accent)";
    case 4:
      return "var(--status-ok)";
    default:
      return "var(--bg-border)";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [signup, { isLoading }] = useSignupMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError =
    emailTouched && !email.includes("@") ? "Enter a valid email address" : null;
  const nameError =
    nameTouched && fullName.trim().length === 0
      ? "Full name is required"
      : null;

  const strengthLevel = getStrengthLevel(password.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setNameTouched(true);

    if (
      !email.includes("@") ||
      fullName.trim().length === 0 ||
      password.length < 1
    )
      return;

    setError(null);
    try {
      const result = await signup({ fullName, email, password }).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      router.replace("/chat");
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { detail?: string | Array<{ msg: string }> } };
      if (apiError.status === 409) {
        setError("Email already registered.");
      } else if (apiError.status === 422 && Array.isArray(apiError.data?.detail)) {
        setError(apiError.data!.detail.map((e) => e.msg).join(". "));
      } else if (apiError.data?.detail && typeof apiError.data.detail === "string") {
        setError(apiError.data.detail);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* ── Left Branding Column ── */}
      <div
        className="relative hidden w-[45%] flex-shrink-0 flex-col justify-between p-10 lg:flex"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        {/* Noise texture overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 0.03 }}
        >
          <svg width="100%" height="100%">
            <filter id="noise-signup">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise-signup)" />
          </svg>
        </div>

        {/* Centered branding content */}
        <div className="flex flex-1 flex-col items-start justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="3"
                stroke="var(--accent)"
                strokeWidth="1.5"
                fill="none"
              />
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
                stroke="var(--accent)"
                strokeWidth="1.5"
                fill="var(--accent)"
                fillOpacity="0.15"
              />
              <rect
                x="9"
                y="9"
                width="6"
                height="6"
                rx="1"
                fill="var(--accent)"
              />
            </svg>
            <span
              className="font-display text-[28px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Eidos
            </span>
          </div>

          {/* Tagline */}
          <p
            className="mt-4 max-w-[280px] font-body text-[15px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Document intelligence that knows when it&apos;s wrong.
          </p>

          {/* Feature lines */}
          <div className="mt-6 flex flex-col gap-3">
            {[
              "Retrieves evidence, not guesses",
              "Critiques every answer it generates",
              "Refuses when confidence is low",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check
                  size={12}
                  strokeWidth={2}
                  style={{ color: "var(--accent)" }}
                  className="flex-shrink-0"
                />
                <span
                  className="font-body text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <span
          className="font-mono text-[11px] uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          Built with LangGraph + Gemini
        </span>
      </div>

      {/* ── Right Form Column ── */}
      <div
        className="flex flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "var(--bg-root)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[360px]"
          noValidate
        >
          <h1
            className="font-display text-[24px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Create your account
          </h1>
          <p
            className="mt-1 mb-8 font-body text-[14px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Start querying your documents
          </p>

          {/* Full Name field */}
          <div>
            <label
              htmlFor="signup-name"
              className="mb-1.5 block font-body text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              placeholder="Rupesh Sharma"
              className="h-11 w-full rounded-lg border px-4 font-body text-[14px] transition-all duration-150 outline-none focus:ring-1"
              style={
                {
                  backgroundColor: "var(--bg-raised)",
                  borderColor: nameError
                    ? "var(--status-fail)"
                    : "var(--bg-border)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--accent)",
                } as React.CSSProperties
              }
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = nameError
                  ? "var(--status-fail)"
                  : "var(--bg-border)")
              }
            />
            {nameError && (
              <p
                className="mt-1 font-body text-[12px]"
                style={{ color: "var(--status-fail)" }}
              >
                {nameError}
              </p>
            )}
          </div>

          {/* Email field */}
          <div className="mt-4">
            <label
              htmlFor="signup-email"
              className="mb-1.5 block font-body text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-lg border px-4 font-body text-[14px] transition-all duration-150 outline-none focus:ring-1"
              style={
                {
                  backgroundColor: "var(--bg-raised)",
                  borderColor: emailError
                    ? "var(--status-fail)"
                    : "var(--bg-border)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--accent)",
                } as React.CSSProperties
              }
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = emailError
                  ? "var(--status-fail)"
                  : "var(--bg-border)")
              }
            />
            {emailError && (
              <p
                className="mt-1 font-body text-[12px]"
                style={{ color: "var(--status-fail)" }}
              >
                {emailError}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mt-4">
            <label
              htmlFor="signup-password"
              className="mb-1.5 block font-body text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border px-4 pr-10 font-body text-[14px] transition-all duration-150 outline-none focus:ring-1"
                style={
                  {
                    backgroundColor: "var(--bg-raised)",
                    borderColor: "var(--bg-border)",
                    color: "var(--text-primary)",
                    "--tw-ring-color": "var(--accent)",
                  } as React.CSSProperties
                }
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--bg-border)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.5} />
                ) : (
                  <Eye size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Password strength bars */}
            <div className="mt-2 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[3px] flex-1 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: getBarColor(i, strengthLevel),
                  }}
                />
              ))}
            </div>

            <p
              className="mt-1.5 font-body text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              Minimum 8 characters
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              className="mt-4 flex items-center gap-2 rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.1)",
                borderColor: "rgba(248, 113, 113, 0.3)",
              }}
            >
              <AlertCircle
                size={14}
                strokeWidth={1.5}
                style={{ color: "var(--status-fail)" }}
                className="flex-shrink-0"
              />
              <span
                className="font-body text-[13px]"
                style={{ color: "var(--status-fail)" }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Create Account button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg font-body text-[14px] font-medium transition-opacity duration-150 hover:opacity-90 disabled:opacity-70"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg-root)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Divider */}
          <div className="relative mt-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div
                className="w-full border-t"
                style={{ borderColor: "var(--bg-border)" }}
              />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 font-body text-[12px]"
                style={{
                  backgroundColor: "var(--bg-root)",
                  color: "var(--text-muted)",
                }}
              >
                or
              </span>
            </div>
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center font-body text-[13px]">
            <span style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
            </span>
            <a
              href="/login"
              className="transition-opacity duration-150 hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
