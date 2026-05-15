// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema(
//   {
//     // ✅ Basic Info
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ },
//     password: { type: String, required: true, minlength: 6 },
    
//     // ✅ Profile
//     avatar: {
//      type: String,
//      default: "",
// },
   
    
//     // ✅ Email Verification
//     isEmailVerified: { type: Boolean, default: false },
//     emailVerificationToken: { type: String, default: null },
//     emailVerificationExpiry: { type: Date, default: null },
    
//     // ✅ Account Status
//     status: { type: String, enum: ["active", "inactive", "suspended", "pending"], default: "active" },
    
//     // ✅ Password Recovery
//     passwordResetToken: { type: String, default: null },
//     passwordResetExpiry: { type: Date, default: null },
    
//     // ✅ Multi-Tenant Support (SaaS)
//     organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
//     role: { type: String, enum: ["admin", "user", "viewer"], default: "user" },
    
//     // ✅ Account Metadata
//     lastLogin: { type: Date, default: null },
//     loginAttempts: { type: Number, default: 0 },
//     lockUntil: { type: Date, default: null },
//     isLocked: { type: Boolean, default: false },
    
//     // ✅ Preferences
//     preferences: {
//       twoFactorEnabled: { type: Boolean, default: false },
//       notificationsEnabled: { type: Boolean, default: true },
//       theme: { type: String, enum: ["light", "dark"], default: "light" },
//     },
//   },
//   { timestamps: true }
// );

// // ✅ Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // ✅ Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ Generate verification token
// userSchema.methods.generateEmailVerificationToken = function () {
//   const token = require("crypto").randomBytes(32).toString("hex");
//   this.emailVerificationToken = require("crypto").createHash("sha256").update(token).digest("hex");
//   this.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
//   return token;
// };

// // ✅ Generate password reset token
// userSchema.methods.generatePasswordResetToken = function () {
//   const token = require("crypto").randomBytes(32).toString("hex");
//   this.passwordResetToken = require("crypto").createHash("sha256").update(token).digest("hex");
//   this.passwordResetExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
//   return token;
// };

// // ✅ Check if account is locked
// userSchema.methods.isAccountLocked = function () {
//   return this.lockUntil && this.lockUntil > Date.now();
// };

// // ✅ Increment login attempts
// userSchema.methods.incLoginAttempts = async function () {
//   const maxAttempts = 5;
//   const lockTime = 1 * 30 * 1000; // 15 minutes

//   if (this.lockUntil && this.lockUntil < Date.now()) {
//     return await this.updateOne({
//       $set: { loginAttempts: 1, isLocked: false, lockUntil: null },
//     });
//   }

//   if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
//     return await this.updateOne({
//       $set: {
//         isLocked: true,
//         lockUntil: Date.now() + lockTime,
//         loginAttempts: this.loginAttempts + 1,
//       },
//     });
//   }

//   return await this.updateOne({ $inc: { loginAttempts: 1 } });
// };

// // ✅ Reset login attempts
// userSchema.methods.resetLoginAttempts = async function () {
//   return await this.updateOne({
//     $set: { loginAttempts: 0, isLocked: false, lockUntil: null },
//   });
// };

// // ✅ Create index for email verification expiry (auto-delete expired docs after 24h)
// userSchema.index({ emailVerificationExpiry: 1 }, { expireAfterSeconds: 0, sparse: true });

// // ✅ Create index for password reset expiry
// userSchema.index({ passwordResetExpiry: 1 }, { expireAfterSeconds: 0, sparse: true });

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// export default User;



// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// /* =========================================
//    USER SCHEMA
// ========================================= */
// const userSchema = new mongoose.Schema(
//   {
//     /* =====================================
//        BASIC INFO
//     ===================================== */
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 50,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       match:
//         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
//     },

//     password: {
//       type: String,
//       required: true,
//       minlength: 6,

//       // IMPORTANT SECURITY
//       select: false,
//     },

//     /* =====================================
//        PROFILE
//     ===================================== */
//     avatar: {
//       type: String,
//       default: "",
//     },

//     phone: {
//       type: String,
//       default: "",
//     },

//     /* =====================================
//        ACCOUNT STATUS
//     ===================================== */
//     status: {
//       type: String,
//       enum: [
//         "active",
//         "inactive",
//         "suspended",
//         "pending",
//       ],
//       default: "active",
//     },

//     role: {
//       type: String,
//       enum: ["admin", "user", "viewer"],
//       default: "user",
//     },

//     /* =====================================
//        EMAIL VERIFICATION
//     ===================================== */
//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },

//     emailVerificationToken: {
//       type: String,
//       default: null,
//     },

//     emailVerificationExpiry: {
//       type: Date,
//       default: null,
//     },

//     /* =====================================
//        PASSWORD RESET
//     ===================================== */
//     passwordResetToken: {
//       type: String,
//       default: null,
//     },

//     passwordResetExpiry: {
//       type: Date,
//       default: null,
//     },

//     /* =====================================
//        ORGANIZATION
//     ===================================== */
//     organizationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Organization",
//       default: null,
//     },

//     /* =====================================
//        SECURITY
//     ===================================== */
//     lastLogin: {
//       type: Date,
//       default: null,
//     },

//     loginAttempts: {
//       type: Number,
//       default: 0,
//     },

//     lockUntil: {
//       type: Date,
//       default: null,
//     },

//     isLocked: {
//       type: Boolean,
//       default: false,
//     },

//     /* =====================================
//        USER PREFERENCES
//     ===================================== */
//     preferences: {
//       twoFactorEnabled: {
//         type: Boolean,
//         default: false,
//       },

//       notificationsEnabled: {
//         type: Boolean,
//         default: true,
//       },

//       theme: {
//         type: String,
//         enum: ["light", "dark"],
//         default: "light",
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// /* =========================================
//    HASH PASSWORD BEFORE SAVE
// ========================================= */
// userSchema.pre("save", async function (next) {
//   try {
//     // VERY IMPORTANT
//     // Prevent rehashing on profile updates
//     if (!this.isModified("password")) {
//       return next();
//     }

//     const salt = await bcrypt.genSalt(10);

//     this.password = await bcrypt.hash(
//       this.password,
//       salt
//     );

//     next();

//   } catch (error) {
//     next(error);
//   }
// });

// /* =========================================
//    PASSWORD COMPARISON
// ========================================= */
// userSchema.methods.comparePassword =
//   async function (candidatePassword) {
//     return await bcrypt.compare(
//       candidatePassword,
//       this.password
//     );
//   };

// /* =========================================
//    ACCOUNT LOCK CHECK
// ========================================= */
// userSchema.methods.isAccountLocked =
//   function () {
//     return (
//       this.lockUntil &&
//       this.lockUntil > Date.now()
//     );
//   };

// /* =========================================
//    INCREMENT LOGIN ATTEMPTS
// ========================================= */
// userSchema.methods.incLoginAttempts =
//   async function () {
//     const MAX_ATTEMPTS = 5;

//     // 30 mins
//     const LOCK_TIME = 30 * 60 * 1000;

//     // reset if expired
//     if (
//       this.lockUntil &&
//       this.lockUntil < Date.now()
//     ) {
//       return await this.updateOne({
//         $set: {
//           loginAttempts: 1,
//           isLocked: false,
//           lockUntil: null,
//         },
//       });
//     }

//     // lock account
//     if (
//       this.loginAttempts + 1 >=
//         MAX_ATTEMPTS &&
//       !this.isLocked
//     ) {
//       return await this.updateOne({
//         $set: {
//           isLocked: true,
//           lockUntil:
//             Date.now() + LOCK_TIME,
//           loginAttempts:
//             this.loginAttempts + 1,
//         },
//       });
//     }

//     // increment normally
//     return await this.updateOne({
//       $inc: { loginAttempts: 1 },
//     });
//   };

// /* =========================================
//    RESET LOGIN ATTEMPTS
// ========================================= */
// userSchema.methods.resetLoginAttempts =
//   async function () {
//     return await this.updateOne({
//       $set: {
//         loginAttempts: 0,
//         isLocked: false,
//         lockUntil: null,
//       },
//     });
//   };

// /* =========================================
//    INDEXES
// ========================================= */
// userSchema.index(
//   {
//     emailVerificationExpiry: 1,
//   },
//   {
//     expireAfterSeconds: 0,
//     sparse: true,
//   }
// );

// userSchema.index(
//   {
//     passwordResetExpiry: 1,
//   },
//   {
//     expireAfterSeconds: 0,
//     sparse: true,
//   }
// );

// /* =========================================
//    MODEL
// ========================================= */
// const User =
//   mongoose.models.User ||
//   mongoose.model("User", userSchema);

// export default User;




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
      minlength: 6,
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
  const LOCK_TIME = 1 * 60 * 1000; // 30 mins

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