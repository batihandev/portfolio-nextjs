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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// The captcha is checked here, where the mail is sent, so a direct POST cannot skip it.
async function captchaPassed(token: string): Promise<boolean> {
  const secret = process.env.CAPTCHA_SECRET_KEY;
  if (!secret || !token) return false;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export async function POST(req: Request) {
  const { name, email, subject, message, captchaToken } =
    (await req.json()) as MailPayload;

  if (!email || !message) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  if (
    email.length > 254 ||
    message.length > 5000 ||
    (name?.length ?? 0) > 100 ||
    (subject?.length ?? 0) > 200
  ) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  if (!(await captchaPassed(captchaToken))) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${SENDER}>`,
      to: site.email,
      replyTo: email,
      subject: subject || "(no subject)",
      text: `${message}\n\nemail: ${email}\nname: ${name}`,
    });
  } catch (error) {
    console.error("send-mail failed", error);
    return NextResponse.json({ success: false }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
