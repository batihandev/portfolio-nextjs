import { NextResponse } from "next/server";

type VerifyResponse = { success: boolean };

export async function POST(req: Request) {
  const { token } = (await req.json()) as { token: string };
  const secretKey = process.env.CAPTCHA_SECRET_KEY;

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  const response = await fetch(verifyUrl, { method: "POST" });
  const data = (await response.json()) as VerifyResponse;

  return NextResponse.json(
    { success: data.success },
    { status: data.success ? 200 : 400 },
  );
}
