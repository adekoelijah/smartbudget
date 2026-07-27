// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// /**
//  * Send an email
//  */
// export const sendEmail = async ({
//   to,
//   subject,
//   html,
// }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       console.error("RESEND_ERROR:", error);
//       throw new Error(error.message);
//     }

//     return data;
//   } catch (error) {
//     console.error("EMAIL_SERVICE_ERROR:", error);
//     throw error;
//   }
// };

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;


export const sendEmail = async ({
  from,
  to,
  subject,
  html,
}) => {

  if (!resend) {
    console.warn(
      "RESEND_API_KEY missing. Email skipped."
    );

    return null;
  }


  try {

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });


    return response;

  } catch (error) {

    console.error(
      "Email sending failed:",
      error.message
    );

    throw error;
  }
};