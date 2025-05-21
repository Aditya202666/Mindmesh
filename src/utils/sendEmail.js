import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (receiver, subject, message) => {
    try {
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: receiver,
            subject: subject,
            html: message,
        });
    } catch (error) {
        throw new ApiError(500, "Email sending failed");
    }
};

const generateOtpEmailTemplate = (type, otp, expiryMinutes) => {
    const isVerify = type === "verify";
    const title = isVerify ? "Confirm Your Account" : "Reset Your Password";
    const intro = isVerify
        ? "Thank you for signing up. Please use the following OTP (One-Time Password) to verify your account:"
        : "You’ve requested to reset your password. Use the OTP below to proceed:";
    const fallback = isVerify
        ? "If you didn’t request this, please ignore this email."
        : "If you didn’t request a password reset, you can safely ignore this email.";

    return `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color: #f4f4f4;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-radius: 12px; overflow: hidden;">
          <!-- Sticky Note Body -->
          <tr>
            <td style="background-color: #fef9c3; padding: 30px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px; text-align: center;">${title}</h1>

              <p style="font-size: 16px; color: #333333; margin: 0 0 16px;">
                Hello,
              </p>
              <p style="font-size: 16px; color: #333333; margin: 0 0 16px;">
                ${intro}
              </p>

              <p style="font-size: 28px; font-weight: bold; color: #b45309; text-align: center; margin: 24px 0;">
                ${otp}
              </p>

              <p style="font-size: 14px; color: #555555; margin: 0 0 24px;">
                This OTP is valid for ${expiryMinutes} minute${expiryMinutes > 1 ? 's' : ''}. Do not share this code with anyone.
              </p>

              <p style="font-size: 14px; color: #777777; margin: 24px 0 0;">
                ${fallback}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f1f1f1; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="font-size: 12px; color: #888888; margin: 0;">
                &copy; 2025 Mindmesh. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

export { sendEmail, generateOtpEmailTemplate };
