import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ✅ Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ },
    password: { type: String, required: true, minlength: 6 },
    
    // ✅ Profile
    profilePicture: { type: String, default: null },
    phone: { type: String, default: null },
    
    // ✅ Email Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpiry: { type: Date, default: null },
    
    // ✅ Account Status
    status: { type: String, enum: ["active", "inactive", "suspended", "pending"], default: "active" },
    
    // ✅ Password Recovery
    passwordResetToken: { type: String, default: null },
    passwordResetExpiry: { type: Date, default: null },
    
    // ✅ Multi-Tenant Support (SaaS)
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    role: { type: String, enum: ["admin", "user", "viewer"], default: "user" },
    
    // ✅ Account Metadata
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    isLocked: { type: Boolean, default: false },
    
    // ✅ Preferences
    preferences: {
      twoFactorEnabled: { type: Boolean, default: false },
      notificationsEnabled: { type: Boolean, default: true },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Generate verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = require("crypto").randomBytes(32).toString("hex");
  this.emailVerificationToken = require("crypto").createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// ✅ Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = require("crypto").randomBytes(32).toString("hex");
  this.passwordResetToken = require("crypto").createHash("sha256").update(token).digest("hex");
  this.passwordResetExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  return token;
};

// ✅ Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// ✅ Increment login attempts
userSchema.methods.incLoginAttempts = async function () {
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1, isLocked: false, lockUntil: null },
    });
  }

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    return await this.updateOne({
      $set: {
        isLocked: true,
        lockUntil: Date.now() + lockTime,
        loginAttempts: this.loginAttempts + 1,
      },
    });
  }

  return await this.updateOne({ $inc: { loginAttempts: 1 } });
};

// ✅ Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return await this.updateOne({
    $set: { loginAttempts: 0, isLocked: false, lockUntil: null },
  });
};

// ✅ Create index for email verification expiry (auto-delete expired docs after 24h)
userSchema.index({ emailVerificationExpiry: 1 }, { expireAfterSeconds: 0, sparse: true });

// ✅ Create index for password reset expiry
userSchema.index({ passwordResetExpiry: 1 }, { expireAfterSeconds: 0, sparse: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
