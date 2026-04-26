import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type MailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "batihanportfolio@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  const { name, email, subject, message } = (await req.json()) as MailPayload;

  if (!email || !message) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  await transporter.sendMail({
    from: '"Portfolio Contact" <batihanportfolio@gmail.com>',
    to: "batihanportfolio@gmail.com",
    subject,
    text: `${message}\n\nemail: ${email}\nname: ${name}`,
    html: `<p><b>email:</b> ${email}<br/><b>name:</b> ${name}</p><p>${message}</p>`,
  });

  return NextResponse.json({ success: true });
}
