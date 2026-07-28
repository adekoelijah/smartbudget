import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";
import Session from "../../models/Session.js";
import generateToken from "../../utils/generateToken.js";
import generateRefreshToken from "../../utils/generateRefreshToken.js";
import validatePassword from "../../utils/passwordValidator.js";
import { sendEmail } from "../../services/emailService.js";
// import { verificationEmailTemplate, } from "../../services/authEmailTemplates.js";
import { verificationEmailTemplate, passwordResetTemplate,} from "../../services/authEmailTemplates.js";
import setRefreshCookie from "../../utils/setRefreshCookie.js";


// Replace the old line with this
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);




/* =========================================
   RESPONSE HELPERS (CONSISTENT API)
========================================= */
const SESSION_DURATION =
  30 * 24 * 60 * 60 * 1000;

const hashToken = (token)=>{

return crypto
.createHash("sha256")
.update(token)
.digest("hex");

};

const createSession = async ({
  user,
  refreshToken,
  req,
}) => {

  const session =
    await Session.create({

      user:user._id,

      refreshTokenHash:
        hashToken(refreshToken),


      userAgent:
        req.headers["user-agent"] || "unknown",


      ipAddress:
        req.ip,


      device:
        req.headers["user-agent"] || "unknown",


      expiresAt:
        new Date(
          Date.now() +
          30 * 24 * 60 * 60 * 1000
        ),

      lastUsedAt:
        new Date(),

    });


  return session;

};




const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/* =========================================
   SANITIZE USER new lines of code
========================================= */

const sanitizeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
  authProvider: user.authProvider,
  isEmailVerified: user.isEmailVerified,
});

/* =========================================
   GOOGLE AUTH REDIRECT
========================================= */
export const googleAuth = (req, res) => {

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    access_type: "offline",
    prompt: "consent",
  });


  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;


  console.log("GOOGLE AUTH URL:");
  console.log(url);


  return res.redirect(url);
};

/* =========================================
   GOOGLE CALLBACK (CORE AUTH FLOW)
========================================= */
/* =========================================
   GOOGLE CALLBACK
========================================= */
export const googleCallback = async (req, res) => {

  console.log("🔥 GOOGLE CALLBACK HIT");
  console.log("QUERY:", req.query);

  try {

    const { code } = req.query;


    if (!code) {
      return sendError(
        res,
        400,
        "Authorization code missing"
      );
    }


    console.log(
      "REDIRECT URI USED:",
      process.env.GOOGLE_REDIRECT_URI
    );


    const { tokens } = await client.getToken({
  code,
  redirect_uri:
    "https://nexatech-smartbudget-backend.vercel.app/api/auth/google/callback",
});


    console.log("GOOGLE TOKENS RECEIVED");


    if (!tokens.id_token) {
      throw new Error(
        "Google ID token missing"
      );
    }


    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });


    const payload = ticket.getPayload();


    if (!payload?.email) {
      return sendError(
        res,
        401,
        "Invalid Google profile data"
      );
    }


    let user = await User.findOne({
      email: payload.email,
    });


    if (!user) {

  user = await User.create({

    firstName: payload.given_name || "Google",
    lastName: payload.family_name || "User",
    email: payload.email,
    avatar: payload.picture,
    authProvider: "google",
    isEmailVerified: true,
    lastLogin: new Date(),

  });

} else {

  user.authProvider = "google";
  user.avatar = payload.picture;
  user.isEmailVerified = true;
  user.lastLogin = new Date();

  await user.save({
    validateBeforeSave:false,
  });

}


   const refreshToken = generateRefreshToken(user._id);

const session = await createSession({
  user,
  refreshToken,
  req,
});

const token = generateToken(
  user._id,
  session._id
);



    setRefreshCookie(
      res,
      refreshToken
    );


    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${token}`
    );


  } catch (err) {


    console.error("🔥 GOOGLE CALLBACK ERROR");
   console.error("Message:", err.message);
   console.error("Stack:", err.stack);

if (err.response?.data) {
  console.error("Google Response:", err.response.data);
}


    return sendError(
      res,
      500,
      "Google authentication failed"
    );

  }

};

/* =========================================
   SIGNUP
========================================= */
export const signup = async (req, res) => {
  try {
   const {firstName, lastName, email, password,} = req.body;

    if (!firstName ||!lastName ||!email ||!password) {
      return sendError(res, 400, "All fields are required");
    }
    const passwordCheck = validatePassword(password);

if (!passwordCheck.isValid) {
  return sendError(
    res,
    400,
    passwordCheck.errors.join(", ")
  );
}

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return sendError(res, 409, "Email already exists");
    }

    const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password,
    authProvider: "local",
});
const verificationToken =
  user.generateEmailVerificationToken();


await user.save({
  validateBeforeSave: false,
});


const verificationUrl =
`${process.env.API_URL}/auth/verify-email/${verificationToken}`;


const emailTemplate =
verificationEmailTemplate({
  firstName: user.firstName,
  verificationUrl,
});


await sendEmail({
  to: user.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html,
});


return sendSuccess(
  res,
  201,
  "Account created successfully. Please verify your email."
);
    return res.redirect(
 `${process.env.FRONTEND_URL}/email-verified`
);
  

  // } catch (error) {
  //   console.error("SIGNUP_ERROR:", error);
  //   return sendError(res, 500, "Signup failed");
   }catch (error) {
  console.log("========== SIGNUP ERROR ==========");
  console.log(error);

  return res.status(500).json({
    success: false,
    message: error.message,
    error,
  });
}
};

/* =========================================
   LOGIN
========================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    //new line is added here
    if (user.isLocked()) {
    return sendError(
        res,
        423,
        "Account temporarily locked. Please try again later."
    );
}

//ended here

    // if (user.authProvider === "google") {
    //   return sendError(res, 400, "Use Google login instead");
    // }
    if (user.authProvider === "google") {
  return sendError(
    res,
    400,
    "This account uses Google Sign-In. Please continue with Google."
  );
}
    


    if (!user.password) {
      return sendError(res, 500, "Account password not set");
    }

    const isMatch = await user.comparePassword(password);
    if (!user.isEmailVerified) {return sendError(res, 403, "Please verify your email before signing in.");

}

    // if (!isMatch) {
    //   return sendError(res, 401, "Invalid credentials");
    // }
    if (!isMatch) {

    await user.incLoginAttempts();

    return sendError(
        res,
        401,
        "Invalid credentials"
    );
}
await user.resetLoginAttempts();

    // await user.updateOne({ lastLogin: new Date() });

    user.lastLogin = new Date();

user.loginCount += 1;

user.lastLoginIP = req.ip;

user.lastLoginDevice =
    req.headers["user-agent"];

await user.save({
    validateBeforeSave: false,
});

    // const token = generateToken(user._id);

    // return sendSuccess(res, 200, "Login successful", {
    //   token,
    //   user: sanitizeUser(user),
    // });

    const refreshToken = generateRefreshToken(user._id);

const session = await createSession({
  user,
  refreshToken,
  req,
});

const token = generateToken(
  user._id,
  session._id
);



// return sendSuccess(
//   res,
//   200,
//   "Login successful",
//   {
//     token,
//     refreshToken,
//     user: sanitizeUser(user),
//   }
// );

setRefreshCookie(
  res,
  refreshToken
);


return sendSuccess(
  res,
  200,
  "Login successful",
  {
    token,
    user: sanitizeUser(user),
  }
);

  } catch (err) {
    console.error("LOGIN_ERROR:", err);
    return sendError(res, 500, "Login failed");
  }
};
/* =========================================
   CURRENT USER
========================================= */
export const getCurrentUser = async (req, res) => {
  try {

    if (!req.user) {
      return sendError(
        res,
        404,
        "User not found"
      );
    }


    return sendSuccess(
      res,
      200,
      "User fetched",
      {
        user: sanitizeUser(req.user),
      }
    );


  } catch (error) {

    console.error(
      "GET_CURRENT_USER_ERROR:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to fetch user"
    );

  }
};

/* =========================================
   LOGOUT
========================================= */
export const logout = async(req,res)=>{

try {

const refreshToken =
req.cookies.refreshToken;


if(refreshToken){

await Session.findOneAndUpdate(
{
refreshToken,
user:req.user.id,
},
{
revoked:true,
}
);

}


res.clearCookie(
"refreshToken",
{
httpOnly:true,
secure:
process.env.NODE_ENV === "production",
sameSite:
process.env.NODE_ENV === "production"
?"none"
:"lax",
}
);


return sendSuccess(
res,
200,
"Logged out successfully"
);


}catch(error){

console.error(
"LOGOUT_ERROR:",
error
);


return sendError(
res,
500,
"Logout failed"
);

}

};
/* =========================================
   CHANGE PASSWORD
========================================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const passwordCheck = validatePassword(newPassword);

if (!passwordCheck.isValid) {
  return sendError(
    res,
    400,
    passwordCheck.errors.join(", ")
  );
}

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 400, "Current password is incorrect");
    }

    user.password = newPassword;
   await Session.updateMany(
{
user:user._id,
},
{
revoked:true,
}
);
    await user.save();

    return sendSuccess(res, 200, "Password updated successfully");

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return sendError(res, 500, "Password update failed");
  }
};

/* =========================================
   VERIFY EMAIL
========================================= */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return sendError(res, 400, "Verification token is required.");
    }

    // Hash the incoming token so it matches the hashed token in MongoDB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpiry");

    if (!user) {
      return sendError(
        res,
        400,
        "Verification link is invalid or has expired."
      );
    }
//new line of code
    if (user.isEmailVerified) {
      return sendSuccess(
        res,
        200,
        "Your email address has already been verified."
      );
    }
    const RESEND_COOLDOWN = 60 * 1000; // 1 minute

if (
  user.lastVerificationEmailSent &&
  Date.now() - user.lastVerificationEmailSent.getTime() <
    RESEND_COOLDOWN
) {
  return sendError(
    res,
    429,
    "Please wait before requesting another verification email."
  );
}

    // Verify account
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return sendSuccess(
      res,
      200,
      "Email verified successfully. You can now sign in.",
      {
        user: sanitizeUser(user),
      }
    );

  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR:", error);

    return sendError(
      res,
      500,
      "Email verification failed."
    );
  }
};

/* =========================================
   RESEND VERIFICATION EMAIL
========================================= */
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email address is required.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+emailVerificationToken +emailVerificationExpiry");

    /**
     * SECURITY:
     * Never reveal whether an email exists.
     */
    if (!user) {
      return sendSuccess(
        res,
        200,
        "If an account with that email exists, a verification email has been sent."
      );
    }

    if (user.isEmailVerified) {
      return sendError(
        res,
        409,
        "This email address has already been verified."
      );
    }

    // Generate a fresh verification token
    const verificationToken =
      user.generateEmailVerificationToken();

    await user.save({
      validateBeforeSave: false,
    });

    const verificationUrl =
      `${process.env.API_URL}/auth/verify-email/${verificationToken}`;

    const emailTemplate =
      verificationEmailTemplate({
        firstName: user.firstName,
        verificationUrl,
      });

    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    user.lastVerificationEmailSent = new Date();

await user.save({
  validateBeforeSave: false,
});

    return sendSuccess(
      res,
      200,
      "A new verification email has been sent."
    );

  } catch (error) {
    console.error(
      "RESEND_VERIFICATION_EMAIL_ERROR:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to resend verification email."
    );
  }
};

/* =========================================
   FORGOT PASSWORD
========================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;


    if (!email) {
      return sendError(
        res,
        400,
        "Email address is required."
      );
    }


    const normalizedEmail =
      email.trim().toLowerCase();


    const user = await User.findOne({
      email: normalizedEmail,
    });


    /*
      Security:
      Do not reveal whether an account exists.
    */
    if (!user) {
      return sendSuccess(
        res,
        200,
        "If an account exists, a password reset email has been sent."
      );
    }


    if (user.authProvider === "google") {
      return sendError(
        res,
        400,
        "Google accounts cannot reset passwords here."
      );
    }


    const resetToken =
      user.generatePasswordResetToken();


    await user.save({
      validateBeforeSave: false,
    });


    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


    const emailTemplate =
      passwordResetTemplate({
        firstName: user.firstName,
        resetUrl,
      });


    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });


    return sendSuccess(
      res,
      200,
      "Password reset email sent successfully."
    );


  } catch(error){

  console.error("Verification email failed:", error);

  return sendError(
    res,
    500,
    "Account created but verification email could not be sent. Please request a resend."
  );
  }
};

/* =========================================
   RESET PASSWORD
========================================= */
export const resetPassword = async (req, res) => {
  try {

    const { token } = req.params;

    const { password } = req.body;


    if (!token || !password) {
      return sendError(
        res,
        400,
        "Token and new password are required."
      );
    }


    const passwordCheck =
      validatePassword(password);


    if (!passwordCheck.isValid) {
      return sendError(
        res,
        400,
        passwordCheck.errors.join(", ")
      );
    }


    const hashedToken =
      crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");


    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: {
        $gt: Date.now(),
      },
    })
    .select(
      "+passwordResetToken +passwordResetExpiry"
    );


    if (!user) {
      return sendError(
        res,
        400,
        "Reset token is invalid or expired."
      );
    }


    user.password = password;

    user.passwordResetToken = undefined;

    user.passwordResetExpiry = undefined;

    user.passwordChangedAt = new Date();

    await Session.updateMany(
{
user:user._id,
},
{
revoked:true,
}
);


    await user.save();


    return sendSuccess(
      res,
      200,
      "Password reset successful. Please login again."
    );


  } catch(error) {

    console.error(
      "RESET_PASSWORD_ERROR:",
      error
    );


    return sendError(
      res,
      500,
      "Password reset failed."
    );

  }
};

/* =========================================
   REFRESH ACCESS TOKEN
========================================= */
export const refreshAccessToken = async(req,res)=>{

try {


const refreshToken =
req.cookies.refreshToken;


if(!refreshToken){

return sendError(
res,
401,
"Refresh token required."
);

}


const decoded =
jwt.verify(
refreshToken,
process.env.JWT_REFRESH_SECRET
);



const session =
await Session.findOne({

user: decoded.id,

refreshTokenHash:
hashToken(refreshToken),

revoked:false,

});



if(!session){

return sendError(
res,
401,
"Invalid session."
);

}



if(
session.expiresAt < Date.now()
){

session.revoked=true;

await session.save();


return sendError(
res,
401,
"Session expired."
);

}



const user =
await User.findById(decoded.id);



if(!user){

return sendError(
res,
401,
"User not found."
);

}



session.lastUsedAt =
new Date();


await session.save();



const accessToken =
generateToken(user._id);



return sendSuccess(
res,
200,
"Token refreshed successfully.",
{
token:accessToken,
}
);



}catch(error){

console.error(
"REFRESH_TOKEN_ERROR:",
error
);


return sendError(
res,
401,
"Invalid refresh token."
);

}

};

