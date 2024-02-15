import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.EMAIL_TEST,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mail = {
  verifyUserEmail: async function verifyUserEmail(
    name,
    userEmail,
    username,
    token
  ) {
    try {
      let info = await transporter.sendMail({
        from: process.env.EMAIL_TEST,
        to: userEmail,
        subject: `Hello ${name} please verify your email by clicking the link`,
        email: `${process.env.homePageDev} "/verifyUserEmail/" ${username} "/" ${token}`,
      });
    } catch (error) {
        console.log(err)
    }
  },
};

export default mail.verifyUserEmail()