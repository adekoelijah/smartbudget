const baseTemplate = ({
  title,
  preheader,
  greeting,
  intro,
  buttonText,
  buttonUrl,
  footerNote,
  warning,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f8fafc;
font-family:Inter,Segoe UI,Arial,sans-serif;
color:#0f172a;
"
>

<div
style="
max-width:640px;
margin:40px auto;
background:#ffffff;
border-radius:20px;
overflow:hidden;
border:1px solid #e2e8f0;
box-shadow:0 10px 40px rgba(15,23,42,.08);
"
>

<!-- PREHEADER -->
<div
style="
display:none;
font-size:1px;
color:#ffffff;
line-height:1px;
max-height:0;
max-width:0;
opacity:0;
overflow:hidden;
"
>
${preheader}
</div>

<!-- HEADER -->

<div
style="
background:linear-gradient(135deg,#0f172a,#1d4ed8);
padding:40px;
text-align:center;
"
>

<div
style="
width:70px;
height:70px;
margin:auto;
border-radius:18px;
background:rgba(255,255,255,.08);
display:flex;
align-items:center;
justify-content:center;
font-size:32px;
"
>
💳
</div>

<h1
style="
margin:20px 0 0;
color:#ffffff;
font-size:28px;
font-weight:700;
"
>
SmartBudget
</h1>

<p
style="
margin-top:10px;
color:#cbd5e1;
font-size:15px;
"
>
Secure Personal Finance Platform
</p>

</div>

<!-- BODY -->

<div style="padding:48px;">

<h2
style="
margin-top:0;
font-size:26px;
color:#0f172a;
"
>
${greeting}
</h2>

<p
style="
font-size:16px;
line-height:1.8;
color:#475569;
"
>
${intro}
</p>

<div
style="
margin:40px 0;
text-align:center;
"
>

<a
href="${buttonUrl}"
style="
display:inline-block;
padding:16px 34px;
background:#2563eb;
color:#ffffff;
text-decoration:none;
border-radius:12px;
font-weight:600;
font-size:16px;
"
>
${buttonText}
</a>

</div>

${
warning
? `
<div
style="
background:#fef3c7;
padding:18px;
border-radius:12px;
border-left:4px solid #f59e0b;
margin-bottom:30px;
"
>
<p
style="
margin:0;
font-size:14px;
line-height:1.7;
color:#92400e;
"
>
${warning}
</p>
</div>
`
: ""
}

<p
style="
font-size:14px;
line-height:1.8;
color:#64748b;
"
>
If the button above does not work, copy and paste this URL into your browser:
</p>

<p
style="
word-break:break-all;
font-size:13px;
color:#2563eb;
"
>
${buttonUrl}
</p>

<hr
style="
margin:40px 0;
border:none;
border-top:1px solid #e2e8f0;
"
/>

<p
style="
font-size:14px;
color:#64748b;
line-height:1.8;
"
>
${footerNote}
</p>

</div>

<!-- FOOTER -->

<div
style="
padding:30px;
background:#f8fafc;
text-align:center;
font-size:13px;
color:#64748b;
"
>

<p style="margin:0;">
© ${new Date().getFullYear()} SmartBudget.
All rights reserved.
</p>

<p style="margin-top:10px;">
Bank-grade security • Encrypted authentication • Secure financial management
</p>

</div>

</div>

</body>
</html>
`;
};

/* =====================================================
EMAIL VERIFICATION
===================================================== */

export const verificationEmailTemplate = ({
  firstName,
  verificationUrl,
}) => ({
  subject: "Verify your SmartBudget account",

  html: baseTemplate({
    title: "Verify Email",
    preheader: "Verify your SmartBudget account.",
    greeting: `Hi ${firstName},`,
    intro:
      "Welcome to SmartBudget. Before you can access your dashboard, please verify your email address. This helps us protect your account and keeps your financial information secure.",

    buttonText: "Verify Email",

    buttonUrl: verificationUrl,

    warning:
      "This verification link expires in 24 hours. If you did not create this account, you can safely ignore this email.",

    footerNote:
      "Thank you for choosing SmartBudget. We are committed to protecting your financial data with modern security standards.",
  }),
});

/* =====================================================
PASSWORD RESET
===================================================== */

export const passwordResetTemplate = ({
  firstName,
  resetUrl,
}) => ({
  subject: "Reset your SmartBudget password",

  html: baseTemplate({
    title: "Password Reset",

    preheader: "Reset your SmartBudget password.",

    greeting: `Hi ${firstName},`,

    intro:
      "We received a request to reset your password. Click the button below to create a new password.",

    buttonText: "Reset Password",

    buttonUrl: resetUrl,

    warning:
      "This password reset link expires in 30 minutes. If you did not request this reset, you can safely ignore this email.",

    footerNote:
      "For your security, SmartBudget never stores your password in plain text.",
  }),
});

/* =====================================================
WELCOME EMAIL
===================================================== */

export const welcomeEmailTemplate = ({
  firstName,
  dashboardUrl,
}) => ({
  subject: "Welcome to SmartBudget",

  html: baseTemplate({
    title: "Welcome",

    preheader: "Welcome to SmartBudget.",

    greeting: `Welcome ${firstName}!`,

    intro:
      "Your account has been successfully verified. You're now ready to start tracking your income, expenses, budgets, and financial goals from one secure dashboard.",

    buttonText: "Open Dashboard",

    buttonUrl: dashboardUrl,

    footerNote:
      "We're excited to be part of your financial journey. Thank you for trusting SmartBudget.",
  }),
});