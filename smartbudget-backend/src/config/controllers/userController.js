

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