import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { site } from "@/data/site";

type MailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken: string;
};

const SENDER = "batihanportfolio@gmail.com";
const CAPTCHA_TIMEOUT_MS = 5000;

/** The longest each field may be; a required field must also be non-empty. */
const fields = {
  name: { max: 100, required: false },
  email: { max: 254, required: true },
  subject: { max: 200, required: false },
  message: { max: 5000, required: true },
  captchaToken: { max: 4096, required: true },
} as const satisfies Record<keyof MailPayload, { max: number; required: boolean }>;

// One "@", no spaces, and a dot in the domain. The mail server does the real check.
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const rejected = (status: number) => NextResponse.json({ success: false }, { status });

function parsePayload(body: unknown): MailPayload | null {
  if (typeof body !== "object" || body === null) return null;
  const input = body as Record<string, unknown>;
  const payload: Partial<MailPayload> = {};
  for (const [key, rule] of Object.entries(fields) as [keyof MailPayload, (typeof fields)[keyof MailPayload]][]) {
    const value = input[key] ?? "";
    if (typeof value !== "string" || value.length > rule.max) return null;
    if (rule.required && !value.trim()) return null;
    payload[key] = value;
  }
  const result = payload as MailPayload;
  return EMAIL_FORMAT.test(result.email) ? result : null;
}

/** Hostnames a captcha may have been solved on: the site itself, and localhost while developing. */
function allowedCaptchaHosts(): string[] {
  const hosts = [new URL(site.url).hostname];
  if (process.env.NODE_ENV === "development") hosts.push("localhost", "127.0.0.1");
  return hosts;
}

// The captcha is checked here, where the mail is sent, so a direct POST cannot skip it.
async function captchaPassed(token: string): Promise<boolean> {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  if (!secret) return false;
  // A plain timer rather than AbortSignal.timeout, so tests can move it with fake timers.
  const abort = new AbortController();
  const timer = setTimeout(
    () => abort.abort(new DOMException("Captcha check timed out", "TimeoutError")),
    CAPTCHA_TIMEOUT_MS,
  );
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: abort.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: unknown; hostname?: unknown };
    return data.success === true && typeof data.hostname === "string" && allowedCaptchaHosts().includes(data.hostname);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return rejected(400);
  }

  const payload = parsePayload(body);
  if (!payload) return rejected(400);
  if (!(await captchaPassed(payload.captchaToken))) return rejected(400);

  const { name, email, subject, message } = payload;
  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${SENDER}>`,
      to: site.email,
      replyTo: email,
      subject: subject || "(no subject)",
      text: `${message}\n\nemail: ${email}\nname: ${name}`,
    });
  } catch (error) {
    // The error can carry the mail server's reply, so only its code is logged.
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unknown";
    console.error(`send-mail failed (${code})`);
    return rejected(502);
  }

  return NextResponse.json({ success: true });
}
