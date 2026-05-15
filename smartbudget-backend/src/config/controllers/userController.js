
// import User from "../../models/User.js";

// /* =========================================
//    GET CURRENT USER
// ========================================= */
// export const getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error(
//       "GET_CURRENT_USER_ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch user",
//     });
//   }
// };

// /* =========================================
//    UPDATE CURRENT USER
// ========================================= */
// export const updateCurrentUser = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       avatar,
//     } = req.body;

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     /* =========================
//        SAFE FIELD UPDATE
//     ========================= */
//     if (name !== undefined) {
//       user.name = name.trim();
//     }

//     if (email !== undefined) {
//       user.email = email.trim().toLowerCase();
//     }

//     if (avatar !== undefined) {
//       user.avatar = avatar;
//     }

//     await user.save();

//     /* =========================
//        RETURN UPDATED USER
//     ========================= */
//     res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",

//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       avatar: user.avatar,
//     });
//   } catch (error) {
//     console.error(
//       "UPDATE_CURRENT_USER_ERROR:",
//       error
//     );

//     res.status(500).json({
//       success: false,
//       message: "Profile update failed",
//     });
//   }
// };

// /* =========================================
//    UPLOAD AVATAR
// ========================================= */
// export const uploadAvatarController = async (req, res) => {
//   try {
//     console.log("REQ.FILE:", req.file);
//     console.log("HEADERS:", req.headers);
//     console.log("BODY:", req.body);
//     console.log("FILE:", req.file);

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No avatar uploaded",
//       });
//     }

//     // TEMPORARY LOCAL RESPONSE (replace with cloud later)
//     const avatarUrl = `/uploads/${req.file.filename}`;

//     return res.status(200).json({
//       success: true,
//       message: "Avatar uploaded successfully",
//       url: avatarUrl,
//     });

//   } catch (err) {
//     console.error("UPLOAD ERROR:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };



// import User from "../../models/User.js";

// /* =========================================
//    NORMALIZE USER RESPONSE
// ========================================= */
// const sanitizeUser = (user) => ({
//   id: user._id,
//   name: user.name,
//   email: user.email,
//   avatar: user.avatar || "",
//   role: user.role,
//   status: user.status,
//   preferences: user.preferences,
//   createdAt: user.createdAt,
//   updatedAt: user.updatedAt,
// });

// /* =========================================
//    GET CURRENT USER
// ========================================= */
// export const getCurrentUser = async (
//   req,
//   res
// ) => {
//   try {
//     const user = await User.findById(
//       req.user.id
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       user: sanitizeUser(user),
//     });

//   } catch (error) {
//     console.error(
//       "GET_CURRENT_USER_ERROR:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch user",
//     });
//   }
// };

// /* =========================================
//    UPDATE CURRENT USER
// ========================================= */
  
// export const updateCurrentUser = async (req, res) => {
//   try {
//     const { name, email, avatar } = req.body;

//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     /* ===============================
//        SAFE VALIDATION
//     =============================== */

//     if (name !== undefined) {
//       if (!name.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "Name is required",
//         });
//       }

//       user.name = name.trim();
//     }

//     if (email !== undefined) {
//       const normalizedEmail = email.trim().toLowerCase();

//       const emailExists = await User.findOne({
//         email: normalizedEmail,
//         _id: { $ne: user._id },
//       });

//       if (emailExists) {
//         return res.status(409).json({
//           success: false,
//           message: "Email already in use",
//         });
//       }

//       user.email = normalizedEmail;
//     }

//     if (avatar !== undefined) {
//       user.avatar = avatar;
//     }

//     /* ===============================
//        SAVE
//     =============================== */

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         role: user.role,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//     });

//   } catch (error) {
//     console.error("UPDATE_CURRENT_USER_ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Profile update failed",
//     });
//   }
// };
// /* =========================================
//    UPLOAD AVATAR
// ========================================= */
// export const uploadAvatarController =
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "No avatar uploaded",
//         });
//       }

//       // TEMP STORAGE
//       const avatarUrl = `/uploads/${req.file.filename}`;

//       return res.status(200).json({
//         success: true,
//         message:
//           "Avatar uploaded successfully",
//         url: avatarUrl,
//       });

//     } catch (error) {
//       console.error(
//         "UPLOAD_AVATAR_ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           "Avatar upload failed",
//       });
//     }
//   };

import User from "../../models/User.js";

/* =========================================
   SANITIZER
========================================= */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
  status: user.status,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/* =========================================
   GET CURRENT USER
========================================= */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error("GET_CURRENT_USER_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* =========================================
   UPDATE CURRENT USER
========================================= */
export const updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, avatar } = req.body;

    if (name) user.name = name.trim();

    if (email) {
      const exists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = email.toLowerCase();
    }

    if (avatar) user.avatar = avatar;

    await user.save();

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("UPDATE_PROFILE_ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================
   UPLOAD AVATAR
========================================= */
export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No avatar uploaded",
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      url: avatarUrl,
    });

  } catch (error) {
    console.error("UPLOAD_AVATAR_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Avatar upload failed",
    });
  }
};