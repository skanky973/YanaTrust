import { type TextareaHTMLAttributes } from "react";

export function TextAreaField({
  label,
  name,
  error,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-brand-ink">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        className={`min-h-28 rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30 ${
          error ? "border-red-400" : ""
        } ${className}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
