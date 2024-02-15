import User from "../models/userModel.js";
import ApiFeatures from "./../utils/apiFeatures.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import sendMail from "../utils/email.js";

import jwt from "jsonwebtoken";
import util from "util";
import crypto from "crypto";

// JWT SIGN
const userToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.MY_SECRET, {
    expiresIn: "30m",
  });
};

// REGISTER A USER
export const registerUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password)
    throw new CustomError("Required fields are missing!", 400);

  let userExist = await User.findOne({ email });

  if (userExist) {
    const err = new CustomError("User already exist with email", 400);
    return next(err);
  } else {
    const user = await User.create(req.body);

    let token = userToken(user._id);

    console.log("Registered a user");
    return res.status(200).send({
      token,
      user,
      success: "User created check your email to comfirm registration",
    });
  }
});

// GET ALL USERS
export const allUser = asyncErrorHandler(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;

  if (users.length === 0) {
    let err = new CustomError("No users found");
    return next(err);
  }

  return res.send({ length: users.length, users });
});

// USER LOGIN
export const logInUser = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    let err = new CustomError("Missing required fields", 404);
    return next(err);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password, user.password))) {
    let err = new CustomError("Invalid user auth", 404);
    return next(err);
  } else {
    let token = userToken(user._id, user.email);

    console.log(token);
    console.log("Logged in");

    return res.status(201).json({ token, user });
  }
});

// UPDATE A USER
export const updateUser = asyncErrorHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    let err = new CustomError("User not found", 404);
    return next(err);
  } else {
    res.send(updatedUser);
  }
});

// DELETE A USER
export const deleteUser = asyncErrorHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  res.send(deletedUser);
});

// GET A USER
export const currentUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const err = new CustomError("User with this ID not found", 404);
    return next(err);
  }

  return res.status(200).send(user);
});

// AGGREGATION
export const userStat = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { date: { $lte: new Date() } } },
      { $match: { position: { $eq: "BE" } } },
      {
        $group: {
          _id: "$position",
          position: { $avg: "$position" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalPrice: { $sum: "$price" },
          userCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: 1 } },
      // { $match: { position: { $eq: "BE" } } },
    ]);
    return res.status(200).send({ length: stats.length, stats });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

export const userRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.aggregate([
      { $unwind: "$role" },
      {
        $group: {
          _id: "$role",
          roleCount: { $sum: 1 },
          users: { $push: "$name" },
        },
      },
      { $addFields: { role: "$_id" } },

      { $project: { _id: 0 } },
      { $sort: { role: -1 } },
      { $limit: 6 },
      { $match: { role: "admin" } },
    ]);
    return res.status(200).send({ length: users.length, users });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

// AUTHENTICATION
export const protect = asyncErrorHandler(async (req, res, next) => {
  // Read tokken & check if it exist
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    return next(new CustomError("Check testToken", 401));
  }
  // Validate token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.MY_SECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError("User with this token does not exist", 401);
    next(error);
  }

  // If the user changed password when the token was issued
  if (await user.isPasswordChanged(decodedToken.iat)) {
    const error = new CustomError(
      "Password have been changed lately, please login again",
      401
    );
    return next(error);
  }
  // Allow access to route
  req.user = user;
  next();
});

// AUTHORIZATION
// export const restrict = (role) => {
//   return (req, res, next) => {
//     if (req.user.role !== role) {
//       const error = new CustomError("Your not authorize for this action", 403);
//       next(error);
//     }
//     next()
//   };
// };

// MULTI ROLE AUTHORIZATION
export const restrictMulti = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      const error = new CustomError("Your not authorize for this action", 403);
      next(error);
    }
    next();
  };
};

// FORGOT PASSWORD
export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // GET USER BY EMAIL
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new CustomError("User with the given email not found", 404);
    next(error);
  }

  // GENERATE A RANDOM RESET TOKEN
  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // SEND THE TOKEN BACK TO THE USER EMAIL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/user/resetpassword/${resetToken}`;

  const message = `We recieved a password reset request, use the link bellow to reset your password\n\n${resetURL}\n\nThis link will be valid for 10 minutes`;
  try {
    await sendMail({
      email: req.email,
      subject: "Password request received",
      message: message,
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset link sent to user email ",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new CustomError(
        "Error occured sending password reset email, please try again",
        500
      )
    );
  }
});

export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  // CHECK IF USER EXIST WITH THE GIVEN TOKEN AND TOKEN NOT EXPIRED
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Try again", 400);
    next(error);
  }

  // RESET USER PASSWORD
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.save();

  // LOGIN USER
  let loginToken = userToken(user._id, user.email);

  console.log(loginToken);
  console.log("Logged in");

  return res.status(201).json({ token: loginToken, user });
});
