import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (!transporter) {
    if (!process.env.EMAIL_SERVER) {
      console.warn("EMAIL_SERVER not configured; emails will be logged");
      return null;
    }
    transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
  }
  return transporter;
}

export async function sendMail(options: nodemailer.SendMailOptions) {
  const client = getTransporter();
  if (!client) {
    console.log("[mail]", options);
    return { mocked: true };
  }
  return client.sendMail(options);
}
