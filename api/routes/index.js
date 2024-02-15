import express from "express";
import userRouter from "./userRoute.js";
import talentsRouter from "./talentsRoute.js";

const router = express.Router();

router.use("/api/user", userRouter);
router.use("/api/talent", talentsRouter);

export default router;
