import express from "express";

import {
  allUser,
  currentUser,
  logInUser,
  registerUser,
  userStat,
  userRole,
  deleteUser,
  updateUser,
  protect,
  restrictMulti,
  resetPassword,
  forgotPassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.route("/userstat").get(userStat);
userRouter.route("/usersrole/:role").get(userRole);

userRouter.route("/").post(registerUser).get(protect, allUser);
userRouter.route("/login").post(logInUser);
userRouter.route("/forgotpassword").post(forgotPassword);
userRouter.route("/resetpassword/:token").patch(resetPassword);
userRouter
  .route("/:id")
  .get(currentUser)
  .delete(protect, restrictMulti("admin", "recruiter"), deleteUser)
  .put(updateUser);

export default userRouter;
