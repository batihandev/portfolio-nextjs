"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { Loader } from "./Loader";

type Inputs = { name: string; email: string; subject: string; message: string };

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

const fieldClass =
  "w-full rounded-md border-[1.5px] border-line bg-paper px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="grid gap-1.5 text-sm font-semibold">
    {label}
    {children}
  </label>
);

export const ContactForm = () => {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  // The token is single-use, so the server verifies it as part of sending the mail.
  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    if (!captchaToken) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, captchaToken }),
      });
      const data = (await res.json()) as { success: boolean };
      toast(data.success ? "Message sent." : "The message could not be sent.");
      if (data.success) reset();
    } catch {
      toast("The message could not be sent.");
    } finally {
      setSubmitting(false);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input {...register("name")} type="text" autoComplete="name" maxLength={100} className={fieldClass} />
        </Field>
        <Field label="Email">
          <input {...register("email")} type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
        </Field>
      </div>
      <Field label="Subject">
        <input {...register("subject")} type="text" maxLength={200} className={fieldClass} />
      </Field>
      <Field label="Message">
        <textarea {...register("message")} required rows={6} maxLength={5000} className={fieldClass} />
      </Field>
      <ReCAPTCHA key={theme} ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} theme={theme} onChange={setCaptchaToken} />
      <p className="text-xs text-muted">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and{" "}
        <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
      </p>
      <Button type="submit" disabled={!captchaToken || submitting} className="justify-self-start">
        {submitting ? <Loader /> : "Send message"}
      </Button>
    </form>
  );
};
