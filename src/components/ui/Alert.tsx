export function Alert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success";
  children: React.ReactNode;
}) {
  const classes =
    variant === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-brand-green/10 text-brand-green-dark border-brand-green/30";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${classes}`}
    >
      {children}
    </div>
  );
}
