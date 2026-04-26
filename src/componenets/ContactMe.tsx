"use client";
import { useState, useRef, useEffect } from "react";
import { MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import Loader from "./Loader";
import { pageInfo } from "@/data";

type Inputs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

const ContactMe = () => {
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const captchaContainerRef = useRef<HTMLFormElement | null>(null);

  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaVisible, setCaptchaVisible] = useState(false);

  useEffect(() => {
    const node = captchaContainerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCaptchaVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onCaptchaChange = async (token: string | null) => {
    if (!token) return;
    const res = await fetch("/api/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as { success: boolean };
    setVerified(data.success);
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setSubmitting(true);
    setVerified(false);
    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await res.json()) as { success: boolean };
      toast(data.success ? "Mail sent." : "Failed to send mail.");
    } catch {
      toast("Failed to send mail.");
    } finally {
      reset();
      setSubmitting(false);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-7xl flex-col items-center justify-start text-clip px-10 md:text-left">
      <h1 className="pageTitles">Contact</h1>
      <div className="flex h-[calc(100svh-100px)] flex-col items-center space-y-5 overflow-auto px-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-accent sm:space-y-10">
        <div className="mt-10 flex flex-col space-y-3 sm:space-y-10">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
            Feel free to reach out if you&apos;d like to{" "}
            <span className="underline decoration-accent/50">work together</span>
            .
          </h2>
        </div>
        <div className="flex items-center justify-center space-x-5">
          <MapPinIcon className="h-7 w-7 animate-pulse text-accent" />
          <p className="text-base sm:text-xl md:text-2xl">{pageInfo.location}</p>
        </div>
        <div className="flex items-center justify-center space-x-5">
          <EnvelopeIcon className="h-7 w-7 animate-pulse text-accent" />
          <p className="text-base sm:text-xl md:text-2xl">{pageInfo.email}</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          ref={captchaContainerRef}
          className="mx-auto flex w-fit flex-col space-y-2 pb-10"
        >
          <div className="flex space-x-2">
            <input
              {...register("name")}
              placeholder="Name"
              autoComplete="name"
              className="contactInput"
              type="text"
            />
            <input
              {...register("email")}
              placeholder="Email"
              autoComplete="email"
              required
              className="contactInput"
              type="email"
            />
          </div>
          <input
            {...register("subject")}
            placeholder="Subject"
            className="contactInput w-auto"
            type="text"
          />
          <textarea
            {...register("message")}
            placeholder="Message"
            className="contactInput w-auto"
          />

          {captchaVisible && (
            <ReCAPTCHA
              ref={recaptchaRef}
              className="captcha flex w-full! items-center justify-around overflow-hidden"
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={onCaptchaChange}
              theme="dark"
              style={{ transform: "scale(0.95)" }}
            />
          )}

          <button
            type="submit"
            className="rounded-md bg-accent px-10 py-5 text-lg font-bold text-black disabled:opacity-50"
            disabled={!verified || submitting}
          >
            {submitting ? <Loader color="dark:fill-[#e50914]" /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactMe;
