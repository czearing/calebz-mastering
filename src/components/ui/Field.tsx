import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Base = {
  label: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
};

type InputField = Base & {
  as?: "input";
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">;

type TextareaField = Base & {
  as: "textarea";
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export type FieldProps = InputField | TextareaField;

// Label, control, and error in one accessible unit. Label is programmatically
// associated, errors are announced via aria-describedby and aria-invalid.
// Control font is 16px so iOS Safari never zooms on focus. See plan/13.
const labelCls = "text-label font-mono uppercase text-muted";
const controlCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface " +
  "px-[var(--space-4)] py-[var(--space-3)] text-[16px] leading-[1.5] " +
  "text-text placeholder:text-muted transition-colors duration-200 " +
  "hover:border-cyan-dim focus:border-cyan focus:outline-none " +
  "aria-[invalid=true]:border-error";
const errorCls = "text-label font-mono text-error";

// Custom keys consumed by Field. Everything else passes to the DOM control.
const ownKeys = ["label", "error", "hint", "className", "as"] as const;
function domProps<T extends Record<string, unknown>>(props: T) {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!(ownKeys as readonly string[]).includes(key)) out[key] = props[key];
  }
  return out;
}

export const Field = forwardRef<
  HTMLInputElement & HTMLTextAreaElement,
  FieldProps
>(function Field(props, ref) {
  const { label, error, hint, className } = props;
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const shared = {
    id,
    ref,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: controlCls,
    ...domProps(props),
  };

  return (
    <div className={cn("flex flex-col gap-[var(--space-2)]", className)}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {props.as === "textarea" ? (
        <textarea {...shared} />
      ) : (
        <input {...shared} />
      )}
      {hint ? (
        <p id={hintId} className="text-label font-mono text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className={errorCls}>
          {error}
        </p>
      ) : null}
    </div>
  );
});
