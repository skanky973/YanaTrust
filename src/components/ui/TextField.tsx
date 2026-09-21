import { type InputHTMLAttributes } from "react";

export function TextField({
  label,
  name,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Les champs facultatifs sont signalés en toutes lettres plutôt que les
          champs obligatoires par un astérisque : l'astérisque n'a de sens que
          si une légende l'explique quelque part, et il est annoncé « étoile »
          par les lecteurs d'écran. */}
      <label htmlFor={name} className="text-sm font-medium text-brand-ink">
        {label}
        {props.required ? null : (
          <span className="ml-1 font-normal text-brand-ink/65">(facultatif)</span>
        )}
      </label>
      <input
        id={name}
        name={name}
        className={`rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30 ${
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
