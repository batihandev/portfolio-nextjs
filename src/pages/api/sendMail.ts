import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
  email: string;
  subject: string;
  message: string;
  kek: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<boolean>
) {
  async function mail({ name, email, subject, message }: Data) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "batihanportfolio@gmail.com",
        clientId:
          "345305089409-eitp0oudde6mpbgsqbb6us1bejse2jn5.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken:
          "1//04jWrGI7pvOFqCgYIARAAGAQSNwF-L9IrPZl92fGGGlb4nr0t4GaWwVaZ1jcPeHgJdFIAKl35V-4UaxATFiz6B16BVpOyg2Z3a5o",
        accessToken:
          "ya29.a0AVvZVspBYP0hHrpdweDDtM0nzUoUgAHP0o7TVOTXjeUhKSKNq5baPnoFw4t9qFLyzbv3fYJsoXJmQl7oLkOs_06RmcCek4vXW-nQ24k4gAtUvkiQsQX1c1CKzTUi1uYjHADTa4hFAQSEd9YkC_qwbF84_GNDaCgYKAWcSARMSFQGbdwaIfAhbzIm2HlflSyAkXw2p1A0163",
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
    res.status(200).json(true);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  }

  try {
    mail(JSON.parse(req.body));
  } catch {
    res.status(400).json(false);
  }
}

export {};
("use strict");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
