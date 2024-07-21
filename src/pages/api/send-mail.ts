import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  email: string;
  subject: string;
  message: string;
  kek: boolean;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  async function mail({ name, email, subject, message }: Data) {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "batihanportfolio@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Portfoliom Contact" <batihanportfolio@gmail.com>', // sender address
      to: "batihanportfolio@gmail.com", // list of receivers
      subject: `${subject}`, // Subject line
      text: `${message} email:${email} name:${name}`, // plain text body
      html: `<b>email: ${email} name: ${name}</b> <p>${message}</>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return res.status(200).json({ success: true });
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  }

  try {
    mail(JSON.parse(req.body));
  } catch {
    return res.status(400).json({ success: false });
  }
}

export {};
("use strict");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
