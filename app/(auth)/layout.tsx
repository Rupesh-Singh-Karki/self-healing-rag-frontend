export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-[100dvh] w-full"
      style={{ backgroundColor: "var(--bg-root)" }}
    >
      {children}
    </div>
  );
}
