"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Form primitives. Every control has a visible label, optional hint and an
 * inline error linked with aria-describedby. Values are controlled/uncontrolled
 * by the parent, so they survive failed validation.
 */
interface FieldShell {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const control =
  "w-full rounded-md border bg-paper px-4 text-[1rem] text-ink placeholder:text-ink-mute/70 " +
  "transition-colors duration-150 min-h-12 " +
  "focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-lime-500/30 " +
  "disabled:cursor-not-allowed disabled:bg-cream-deep disabled:text-ink-mute";

function Shell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  locked,
}: FieldShell & { id: string; children: ReactNode; locked?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        )}
        {!required && !locked && <span className="ml-1.5 text-xs font-normal text-ink-mute">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id: string, hint?: string, error?: string) =>
  error ? `${id}-err` : hint ? `${id}-hint` : undefined;

export function Input({ label, hint, error, required, className, ...rest }: FieldShell & ComponentProps<"input">) {
  const uid = useId();
  const id = rest.id ?? uid;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className} locked={rest.disabled}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={cn(control, error ? "border-danger" : "border-line")}
        {...rest}
      />
    </Shell>
  );
}

export function Textarea({ label, hint, error, required, className, ...rest }: FieldShell & ComponentProps<"textarea">) {
  const uid = useId();
  const id = rest.id ?? uid;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        required={required}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={cn(control, "py-3 resize-y", error ? "border-danger" : "border-line")}
        {...rest}
      />
    </Shell>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  className,
  children,
  ...rest
}: FieldShell & ComponentProps<"select">) {
  const uid = useId();
  const id = rest.id ?? uid;
  return (
    <Shell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(id, hint, error)}
        className={cn(control, "appearance-none bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-11", error ? "border-danger" : "border-line")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23564d43' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
        }}
        {...rest}
      >
        {children}
      </select>
    </Shell>
  );
}

export function Checkbox({ label, className, ...rest }: { label: ReactNode; className?: string } & ComponentProps<"input">) {
  const uid = useId();
  return (
    <label htmlFor={rest.id ?? uid} className={cn("flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink-soft", className)}>
      <input
        id={rest.id ?? uid}
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-tea-600"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}

/** Radio card for payment / pack options. */
export function RadioCard({
  checked,
  onChange,
  name,
  value,
  title,
  description,
  disabled,
  right,
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
  title: string;
  description?: string;
  disabled?: boolean;
  right?: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
        checked ? "border-tea-600 bg-tea-50 ring-2 ring-tea-600/20" : "border-line bg-paper hover:border-tea-400",
        disabled && "cursor-not-allowed opacity-55",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-tea-600"
      />
      <span className="flex-1">
        <span className="block font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-mute">{description}</span>}
      </span>
      {right}
    </label>
  );
}
