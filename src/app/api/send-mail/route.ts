import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type MailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "batihanportfolio@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// Verify the reCAPTCHA token here, on the endpoint that actually sends mail.
// Gating only the client (a separate verify call that flips a button) leaves
// this route open to a direct POST, so the captcha must be checked at the
// point of the privileged action.
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

  await transporter.sendMail({
    from: '"Portfolio Contact" <batihanportfolio@gmail.com>',
    to: "batihanportfolio@gmail.com",
    replyTo: email,
    subject: subject || "(no subject)",
    text: `${message}\n\nemail: ${email}\nname: ${name}`,
  });

  return NextResponse.json({ success: true });
}
