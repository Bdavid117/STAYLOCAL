import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

type CommonProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-mute transition-colors hover:border-ink/30 focus:border-ink focus:bg-bone focus:outline-none";

const labelCls =
  "block font-mono text-[10px] uppercase tracking-widest text-ink-soft";

function Wrapper({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: CommonProps & { id: string; children: ReactNode }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && <span aria-hidden className="ml-1 text-terracotta">•</span>}
        {required && <span className="sr-only">(requerido)</span>}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-terracotta-deep" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = CommonProps & InputHTMLAttributes<HTMLInputElement>;
export function Field({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  ...input
}: FieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Wrapper label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <input
        {...input}
        id={id}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={inputCls}
      />
    </Wrapper>
  );
}

type TextareaFieldProps = CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>;
export function TextareaField({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  rows = 5,
  ...input
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Wrapper label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <textarea
        {...input}
        id={id}
        rows={rows}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className="w-full rounded-lg border border-line bg-paper p-3 text-sm text-ink placeholder:text-ink-mute transition-colors hover:border-ink/30 focus:border-ink focus:bg-bone focus:outline-none"
      />
    </Wrapper>
  );
}

type SelectFieldProps = CommonProps & SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
};
export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  id: providedId,
  children,
  ...input
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Wrapper label={label} hint={hint} error={error} required={required} id={id} className={className}>
      <select
        {...input}
        id={id}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${inputCls} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='%231a1612' d='M6 8L0 0h12z'/></svg>")] bg-[length:10px] bg-[right_0.85rem_center] bg-no-repeat pr-9`}
      >
        {children}
      </select>
    </Wrapper>
  );
}