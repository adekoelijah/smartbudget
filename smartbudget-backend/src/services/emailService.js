import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("RESEND_ERROR:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("EMAIL_SERVICE_ERROR:", error);
    throw error;
  }
};