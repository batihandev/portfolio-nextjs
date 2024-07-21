import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  const token = body.token;
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verifyUrl, { method: "POST" });
    const data = await response.json();

    if (data.success) {
      // Token is valid, proceed with the user's request
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false });
      // Token is invalid, respond accordingly
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
}
