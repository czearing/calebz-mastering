"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Field, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  inquirySchema,
  inquiryDefaults,
  projectTypes,
  type InquiryInput,
} from "@/lib/inquiry";
import { submitInquiry } from "@/app/actions/inquiry";

// Zod resolver without the @hookform/resolvers dependency. Maps zod issues onto
// react-hook-form's error shape so inline errors render under each field.
const resolver: Resolver<InquiryInput> = (values) => {
  const r = inquirySchema.safeParse(values);
  if (r.success) return { values: r.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0]);
    if (!errors[key]) errors[key] = { type: "zod", message: issue.message };
  }
  return { values: {}, errors };
};

const labelCls = "text-label font-mono uppercase text-muted";
const selectCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface " +
  "px-[var(--space-4)] py-[var(--space-3)] text-[16px] leading-[1.5] " +
  "text-text transition-colors duration-200 hover:border-cyan-dim " +
  "focus:border-cyan focus:outline-none aria-[invalid=true]:border-error";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({ resolver, defaultValues: inquiryDefaults });

  async function onSubmit(values: InquiryInput) {
    setFailed(false);
    const res = await submitInquiry(values);
    if (res.ok) setSent(true);
    else setFailed(true);
  }

  if (sent) {
    return (
      <p role="status" className="text-body text-text">
        Thanks. I&apos;ll reply within one business day.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[var(--space-5)]"
    >
      <Field label="Name" {...register("name")} error={errors.name?.message} />
      <Field
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="flex flex-col gap-[var(--space-2)]">
        <label htmlFor="projectType" className={labelCls}>
          Project type
        </label>
        <select
          id="projectType"
          className={selectCls}
          aria-invalid={errors.projectType ? true : undefined}
          {...register("projectType")}
        >
          {projectTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.projectType ? (
          <p role="alert" className="text-label font-mono text-error">
            {errors.projectType.message}
          </p>
        ) : null}
      </div>

      <Field
        label="Links"
        {...register("links")}
        hint="Reference tracks or your release, optional."
        error={errors.links?.message}
      />
      <Field
        as="textarea"
        rows={4}
        label="Message"
        placeholder="What can I help with?"
        {...register("message")}
        error={errors.message?.message}
      />

      <div aria-hidden className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {failed ? (
        <p role="alert" className="text-label font-mono text-error">
          That did not send. Check your details and try again.
        </p>
      ) : null}

      <div className="flex flex-col gap-[var(--space-3)]">
        <Button type="submit" disabled={isSubmitting} className={cn(isSubmitting && "opacity-50")}>
          Send message
        </Button>
        <p className="text-label font-mono text-muted">
          No commitment. I read every message myself.
        </p>
      </div>
    </form>
  );
}
