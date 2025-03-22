import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { asyncHandler } from "./asyncHandler.js";

// Load environment variables
dotenv.config();

const mailSender = asyncHandler(async (mail, subject, body) => {
  try {
    //* Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    //* Send Mail
    let info = await transporter.sendMail({
      from: `"MENTPAT | Uttam Upadhyay" <${process.env.MAIL_USER}>`,
      to: mail,
      subject: subject,
      html: body,
    });

    //* Mail sent successfully!
    console.log("Mail sent successfully!\nInfo: ", info);
  } catch (error) {
    console.error("Failed to send mail:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
});

export default mailSender;
