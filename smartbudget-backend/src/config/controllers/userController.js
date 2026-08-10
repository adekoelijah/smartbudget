
import User from "../../models/User.js";

/* =========================================
   SANITIZE USER
========================================= */

const sanitizeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName:
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
  status: user.status,
  authProvider: user.authProvider,
  isEmailVerified: user.isEmailVerified,
  preferences: user.preferences,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/* =========================================
   GET CURRENT USER
   GET /api/users/profile
========================================= */

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("GET_CURRENT_USER_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
};

/* =========================================
   UPDATE CURRENT USER
   PUT /api/users/profile
========================================= */

export const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      firstName,
      lastName,
      email,
      avatar,
    } = req.body;

    /* -----------------------------------------
       VALIDATE FIRST NAME
    ----------------------------------------- */

    if (firstName !== undefined) {
      const trimmedFirstName = firstName.trim();

      if (!trimmedFirstName) {
        return res.status(400).json({
          success: false,
          message: "First name cannot be empty.",
        });
      }

      user.firstName = trimmedFirstName;
    }

    /* -----------------------------------------
       VALIDATE LAST NAME
    ----------------------------------------- */

    if (lastName !== undefined) {
      const trimmedLastName = lastName.trim();

      if (!trimmedLastName) {
        return res.status(400).json({
          success: false,
          message: "Last name cannot be empty.",
        });
      }

      user.lastName = trimmedLastName;
    }

    /* -----------------------------------------
       UPDATE EMAIL
       
       NOTE:
       Email changes should ideally trigger
       email verification again.
    ----------------------------------------- */

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email address cannot be empty.",
        });
      }

      if (normalizedEmail !== user.email) {
        const existingUser = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email address is already in use.",
          });
        }

        user.email = normalizedEmail;

        /*
         * IMPORTANT:
         * If your application requires email verification
         * after an email change, set:
         *
         * user.isEmailVerified = false;
         *
         * and generate/send a new verification token.
         */
      }
    }

    /* -----------------------------------------
       UPDATE AVATAR
    ----------------------------------------- */

    if (avatar !== undefined) {
      user.avatar = avatar || "";
    }

    /* -----------------------------------------
       SAVE USER
    ----------------------------------------- */

    await user.save();

    /* -----------------------------------------
       RESPONSE
    ----------------------------------------- */

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

/* =========================================
   UPLOAD AVATAR
   POST /api/users/avatar
========================================= */

export const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No avatar uploaded.",
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully.",
      url: avatarUrl,
    });
  } catch (error) {
    console.error("UPLOAD_AVATAR_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Avatar upload failed.",
    });
  }
};

