

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/* =========================================
   USER SCHEMA (PRODUCTION GRADE)
========================================= */
const userSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 8,
      select: false,
    },

    /* AUTH PROVIDER (CRITICAL FIX) */
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    /* PROFILE */
    avatar: {
      type: String,
      default: "",
    },

    /* ROLE SYSTEM */
    role: {
      type: String,
      enum: ["admin", "user", "viewer"],
      default: "user",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    /* EMAIL VERIFICATION */
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpiry: Date,

    /* PASSWORD RESET */
    passwordResetToken: String,
    passwordResetExpiry: Date,

    /* SECURITY */
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    lastLogin: Date,

    /* PREFERENCES */
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notificationsEnabled: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

/* =========================================
   PASSWORD HASHING
========================================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================================
   PASSWORD COMPARE
========================================= */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/* =========================================
   ACCOUNT LOCK LOGIC
========================================= */
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 1 * 60 * 1000; // 1 mins

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1,
        lockUntil: null,
      },
    });
  }

  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    return this.updateOne({
      $set: {
        loginAttempts: MAX_ATTEMPTS,
        lockUntil: Date.now() + LOCK_TIME,
      },
    });
  }

  return this.updateOne({ $inc: { loginAttempts: 1 } });
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: {
      loginAttempts: 0,
      lockUntil: null,
    },
  });
};

/* =========================================
   EMAIL VERIFICATION TOKEN (FIXED ESM CRYPTO)
========================================= */
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return token;
};

/* =========================================
   PASSWORD RESET TOKEN
========================================= */
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpiry = Date.now() + 30 * 60 * 1000;

  return token;
};

/* =========================================
   MODEL EXPORT
========================================= */
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;