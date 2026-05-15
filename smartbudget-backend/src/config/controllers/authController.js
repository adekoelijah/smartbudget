// import bcrypt from "bcryptjs";

// import User from "../../models/User.js";
// //import generateToken from "../utils/generateToken.js";
// import generateToken from "../../utils/generateToken.js";


// /* =========================
//    SIGNUP
// ========================= */
// export const signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     const existingUser = await User.findOne({
//       email: email.toLowerCase(),
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//     });

//     const token = generateToken(user._id);

//     return res.status(201).json({
//       success: true,
//       message: "Account created successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================
//    LOGIN
// ========================= */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and password required",
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase(),
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = generateToken(user._id);

//     return res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================
//    GET CURRENT USER
// ========================= */
// export const getCurrentUser = async (req, res) => {
//   try {
//     return res.json({
//       success: true,
//       user: req.user,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// //logout

// export const logout = async (req, res) => {
//   try {
//     return res.json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* =========================
//    CHANGE PASSWORD
// ========================= */
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const isMatch = await bcrypt.compare(
//       currentPassword,
//       user.password
//     );

//     if (!isMatch) {
//       return res.status(400).json({
//         success: false,
//         message: "Current password is incorrect",
//       });
//     }

//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     return res.json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// import { OAuth2Client } from "google-auth-library";

// import User from "../../models/User.js";
// import jwt from "jsonwebtoken";
// import generateToken from "../../utils/generateToken.js";






// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export const googleAuth = (req, res) => {
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;

//   res.redirect(url);
// };
// /* =========================================
//    SANITIZE USER
// ========================================= */
// const sanitizeUser = (user) => ({
//   id: user._id,
//   name: user.name,
//   email: user.email,
//   avatar: user.avatar || "",
//   role: user.role,
//   status: user.status,
// });

// /* =========================================
//    SIGNUP
// ========================================= */
// export const signup = async (req, res) => {
//   try {
//     const { name, email, password } =
//       req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please provide all required fields",
//       });
//     }

//     const existingUser =
//       await User.findOne({
//         email: email
//           .trim()
//           .toLowerCase(),
//       });

//     if (existingUser) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "Email already registered",
//       });
//     }

//     // IMPORTANT:
//     // DO NOT HASH HERE
//     // MODEL WILL HASH AUTOMATICALLY

//     const user = await User.create({
//       name: name.trim(),
//       email: email
//         .trim()
//         .toLowerCase(),
//       password,
//     });

//     const token = generateToken(user._id);

//     return res.status(201).json({
//       success: true,
//       message:
//         "Account created successfully",
//       token,
//       user: sanitizeUser(user),
//     });

//   } catch (error) {
//     console.error(
//       "SIGNUP_ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Signup failed",
//     });
//   }
// };

// /* =========================================
//    LOGIN
// ========================================= */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({
//       email: email.toLowerCase(),
//     }).select("+password");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const match = await user.comparePassword(password);

//     if (!match) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = generateToken(user._id);

//     return res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     console.error("LOGIN_ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Login failed",
//     });
//   }
// };
// /* =========================================
//    CURRENT USER
// ========================================= */
// export const getCurrentUser = async (
//   req,
//   res
// ) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       user: req.user,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message:
//         "Failed to fetch user",
//     });
//   }
// };

// //auth controler for google call back

// export const googleCallback = async (req, res) => {
//   try {
//     const { code } = req.query;

//     const { tokens } = await client.getToken({
//       code,
//       redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//     });

//     const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     let user = await User.findOne({ email: payload.email });

//     if (!user) {
//       user = await User.create({
//         name: payload.name,
//         email: payload.email,
//         avatar: payload.picture,
//         provider: "google",
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/auth/success?token=${token}`
//     );
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Google authentication failed",
//     });
//   }
// };

// /* =========================================
//    LOGOUT
// ========================================= */
// export const logout = async (
//   req,
//   res
// ) => {
//   return res.status(200).json({
//     success: true,
//     message:
//       "Logged out successfully",
//   });
// };

// /* =========================================
//    CHANGE PASSWORD
// ========================================= */
// export const changePassword =
//   async (req, res) => {
//     try {
//       const {
//         currentPassword,
//         newPassword,
//       } = req.body;

//       const user =
//         await User.findById(
//           req.user.id
//         ).select("+password");

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           message:
//             "User not found",
//         });
//       }

//       const isMatch =
//         await user.comparePassword(
//           currentPassword
//         );

//       if (!isMatch) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Current password is incorrect",
//         });
//       }

//       // IMPORTANT
//       // DO NOT HASH MANUALLY
//       user.password = newPassword;

//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           "Password updated successfully",
//       });

//     } catch (error) {
//       console.error(
//         "CHANGE_PASSWORD_ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Password update failed",
//       });
//     }
//   };



import { OAuth2Client } from "google-auth-library";
import User from "../../models/User.js";
import generateToken from "../../utils/generateToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================================
   RESPONSE HELPERS (CONSISTENT API)
========================================= */
const sendSuccess = (res, status, message, data = {}) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

/* =========================================
   SANITIZE USER
========================================= */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role || "user",
});

/* =========================================
   GOOGLE AUTH REDIRECT
========================================= */
export const googleAuth = (req, res) => {
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=profile email`;

  return res.redirect(url);
};

/* =========================================
   GOOGLE CALLBACK (CORE AUTH FLOW)
========================================= */
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return sendError(res, 400, "Authorization code missing");
    }

    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return sendError(res, 401, "Invalid Google profile data");
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        provider: "google",
      });
    }

    const token = generateToken(user._id);

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${token}`
    );

  } catch (err) {
    console.error("GOOGLE_CALLBACK_ERROR:", err);
    return sendError(res, 500, "Google authentication failed");
  }
};

/* =========================================
   SIGNUP
========================================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return sendError(res, 409, "Email already exists");
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Account created successfully", {
      token,
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error("SIGNUP_ERROR:", error);
    return sendError(res, 500, "Signup failed");
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

    if (user.provider === "google") {
      return sendError(res, 400, "Use Google login instead");
    }

    if (!user.password) {
      return sendError(res, 500, "Account password not set");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    await user.updateOne({ lastLogin: new Date() });

    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: sanitizeUser(user),
    });

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
    return sendSuccess(res, 200, "User fetched", {
      user: req.user,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch user");
  }
};

/* =========================================
   LOGOUT
========================================= */
export const logout = (req, res) => {
  return sendSuccess(res, 200, "Logged out successfully");
};

/* =========================================
   CHANGE PASSWORD
========================================= */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(res, 400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, "Password updated successfully");

  } catch (error) {
    console.error("CHANGE_PASSWORD_ERROR:", error);
    return sendError(res, 500, "Password update failed");
  }
};