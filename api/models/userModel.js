import mongoose from "mongoose";
import fs from "fs";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      trim: true,
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This validator will only work for save and create method
        validator: function (val) {
          return val === this.password;
        },
        message: "Password mismatch, confirm password",
      },
    },

    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      trim: true,
      lowerCase: true,
      validate: [validator.isEmail, "Please enter valid email."],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    passwordChangedAt: Date,

    jobType: {
      type: String,
    },
    status: { type: Boolean, default: false },

    role: {
      type: String,
      required: [true, "Specify your role here"],
      enum: {
        values: ["talent", "recruiter", "admin"],
        message: "Value must be either talent, recruiter or admin",
        default: "user",
      },
      photo: String,
    },

    rating: Number,

    totalRating: Number,

    date: { type: Date, default: Date.now() },

    createdBy: String,
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

// VIRTUALS
userModel.virtual("currentRole").get(function () {
  return (this.role = "user");
});

// DOCUMENT MIDDLEWARE
userModel.pre("save", function (next) {
  this.createdBy = "Uchenna";
  next();
});

let count = 1;
userModel.post("save", function (doc, next) {
  const content = `${count++}. A user with name ${doc.name} was added by ${
    doc.createdBy
  }\n`;
  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

// QUERY MIDDLEWARE
userModel.pre(/^find/, function (next) {
  this.find({ date: { $lte: Date.now() } });

  this.startTime = Date.now();
  next();
});

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

// AGGREGATION MIDDLEWARE
userModel.pre("aggregate", function (next) {
  console.log(
    this.pipeline().unshift({ $match: { date: { $lte: new Date() } } })
  );
  next();
});

// POST LOG
userModel.post(/^find/, function (docs, next) {
  this.find({ date: { $lte: Date.now() } });
  this.endTime = Date.now();

  const content = `Query took ${
    this.endTime - this.startTime
  }  millisecons to fetch document \n`;
  fs.writeFileSync("./log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

// INSTANCE METHOD
userModel.methods.comparePassword = async function (psswrd, DBpsswrd) {
  return await bcrypt.compare(psswrd, DBpsswrd);
};

userModel.methods.isPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const pswdChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(pswdChangedTimestamp, JWTTimestamp);

    return JWTTimestamp < pswdChangedTimestamp;
  }
  return false;
};

userModel.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log(resetToken, this.passwordResetToken);

  return resetToken;
};


const User = mongoose.model("User", userModel);

export default User;
