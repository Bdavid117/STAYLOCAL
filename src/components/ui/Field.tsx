import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-mute transition-colors hover:border-ink/30 focus:border-ink focus:bg-bone";

const labelCls =
  "block font-mono text-[10px] uppercase tracking-widest text-ink-soft";

function Wrapper({
  label,
  hint,
  error,
  required,
  className,
  children,
}: CommonProps & { children: ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className={labelCls}>
        {label}
        {required && <span aria-hidden className="ml-1 text-terracotta">•</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-terracotta-deep">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-mute">{hint}</p>
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
  ...input
}: FieldProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      <input {...input} required={required} className={inputCls} />
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
  rows = 5,
  ...input
}: TextareaFieldProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        rows={rows}
        required={required}
        {...input}
        className="w-full rounded-lg border border-line bg-paper p-3 text-sm text-ink placeholder:text-ink-mute transition-colors hover:border-ink/30 focus:border-ink focus:bg-bone"
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
  children,
  ...input
}: SelectFieldProps) {
  return (
    <Wrapper label={label} hint={hint} error={error} required={required} className={className}>
      <select
        required={required}
        {...input}
        className={`${inputCls} appearance-none bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path fill='%231a1612' d='M6 8L0 0h12z'/></svg>\")] bg-[length:10px] bg-[right_0.85rem_center] bg-no-repeat pr-9`}
      >
        {children}
      </select>
    </Wrapper>
  );
}
