"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError =
    emailTouched && !email.includes("@") ? "Enter a valid email address" : null;
  const passwordError =
    passwordTouched && password.length === 0 ? "Password is required" : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!email.includes("@") || password.length === 0) return;

    setError(null);
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      router.replace("/chat");
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { detail?: string } };
      if (apiError.status === 401) {
        setError("Invalid email or password.");
      } else if (apiError.status === 403) {
        setError("Account is deactivated.");
      } else if (apiError.data?.detail) {
        setError(
          typeof apiError.data.detail === "string"
            ? apiError.data.detail
            : "Invalid credentials. Please try again."
        );
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
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
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
              <div
                key={feature}
                className="flex items-center gap-2.5"
              >
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
            Welcome back
          </h1>
          <p
            className="mt-1 mb-8 font-body text-[14px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to your workspace
          </p>

          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block font-body text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Email
            </label>
            <input
              id="login-email"
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
              htmlFor="login-password"
              className="mb-1.5 block font-body text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border px-4 pr-10 font-body text-[14px] transition-all duration-150 outline-none focus:ring-1"
                style={
                  {
                    backgroundColor: "var(--bg-raised)",
                    borderColor: passwordError
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
                  (e.currentTarget.style.borderColor = passwordError
                    ? "var(--status-fail)"
                    : "var(--bg-border)")
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
            {passwordError && (
              <p
                className="mt-1 font-body text-[12px]"
                style={{ color: "var(--status-fail)" }}
              >
                {passwordError}
              </p>
            )}
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

          {/* Sign In button */}
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
                Signing in...
              </>
            ) : (
              "Sign In"
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

          {/* Sign up link */}
          <p className="mt-6 text-center font-body text-[13px]">
            <span style={{ color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
            </span>
            <a
              href="/signup"
              className="transition-opacity duration-150 hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
