

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/* =========================================
   USER SCHEMA (PRODUCTION GRADE)
========================================= */
const userSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    // name: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   minlength: 2,
    //   maxlength: 80,
    // },

    // the above is the first production ready app

    firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40,
    set: value => value.trim().replace(/\s+/g, " "),
    match: [ /^[A-Za-z]+$/, "First name can only contain letters",
],
},

lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40,
    set: value => value.trim().replace(/\s+/g, " "),
    match: [
  /^[A-Za-z]+$/,
  "Last name can only contain letters",
],
},

    // email: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   lowercase: true,
    //   trim: true,
    // },

email: {
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  index: true,
  set: value => value.trim().toLowerCase(),
  match: [
    /^\S+@\S+\.\S+$/,
    "Please provide a valid email address",
  ],
},

    // password: {
    //   type: String,
    //   minlength: 8,
    //   select: false,
    // },

    password: {
  type: String,
  minlength: 8,
  maxlength:128,
  select: false,
  validate: {
    validator() {
      if (this.authProvider === "google") return true;
      return !!this.password;
    },
    message: "Password is required.",
  },
},

    /* AUTH PROVIDER (CRITICAL FIX) */
    // provider: {
    //   type: String,
    //   enum: ["local", "google"],
    //   default: "local",
    // },

    // the above is a production ready design

  /* AUTH PROVIDER (CRITICAL FIX) */

    authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
},

    /* PROFILE */
    avatar: {
      type: String,
      default: null,
    },
    profileCompleted: {
    type: Boolean,
    default: false,
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
           deletedAt: {
    type: Date,
    default: null,
},
isActive: {
    type: Boolean,
    default: true,
},
    },
  

    /* EMAIL VERIFICATION */
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },

    // emailVerificationToken: String,
    // emailVerificationExpiry: Date,

    isEmailVerified: {
    type: Boolean,
    default: false,
    index: true,
    
},


//last verify

lastVerificationEmailSent: {
    type: Date,
    default: null,
},



emailVerificationToken: {
    type: String,
    select: false,
},

emailVerificationExpiry: {
    type: Date,
    select: false,
},

    /* PASSWORD RESET */
    // passwordResetToken: String,
    // passwordResetExpiry: Date,

    passwordResetToken: {
    type: String,
    select: false,
},

passwordResetExpiry: {
    type: Date,
    select: false,
    passwordChangedAt: Date,
},


refreshToken: {
    type: String,
    select: false,
},

refreshTokenExpiry: {
    type: Date,
    select: false,
},

passwordChangedAt: {
    type: Date,
},


    /* SECURITY */
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    // lastLogin: Date,

    lastLogin: Date,

lastLoginIP: String,

lastLoginDevice: String,

loginCount: {
    type: Number,
    default: 0,
},

    /* PREFERENCES */
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      notificationsEnabled: { type: Boolean, default: true },
      twoFactorEnabled: { type: Boolean, default: false },
   
    },
  },
  { timestamps: true }
  
);

// Then add a virtual property:
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.set("toJSON", {
    virtuals: true,
    transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.lockUntil;
        delete ret.loginAttempts;
        delete ret.__v;
        return ret;
    },
});



// avatAR

userSchema.virtual("initials").get(function(){

return `${this.firstName[0]}${this.lastName[0]}`;

});
/* =========================================
   PASSWORD HASHING
========================================= */
userSchema.pre("save", async function (next) {
  // if (!this.isModified("password") || !this.password) return;
  if (!this.isModified("password") || !this.password) {
    return next();
    this.passwordChangedAt = Date.now();
}
// newly added

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
  const LOCK_TIME = 15 * 60 * 1000; // 1 mins

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


// newly added
// userSchema.index({ email: 1 });

userSchema.index({
    emailVerificationToken: 1,
});

userSchema.index({
    passwordResetToken: 1,
});

userSchema.index({
    authProvider: 1,
});
/* =========================================
   MODEL EXPORT
========================================= */
const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;