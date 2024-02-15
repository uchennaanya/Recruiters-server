import express from "express";

import {
  createTalent,
  getTalents,
  getTalent,
  updateTalent,
  deleteTalent,
  talentLogin,
} from "../controllers/talentController.js";

import { validateTalent } from "../middleware/talentsAuth.js";

const talentRouter = express.Router();

talentRouter.post("/createtalent", createTalent);
talentRouter.get("/gettalents", getTalents);
talentRouter.get("/gettalent/:id", getTalent);
talentRouter.patch("/updatetalent/:id", updateTalent);
talentRouter.delete("/deletetalent/:id", deleteTalent);
talentRouter.post("/talentLogin/", validateTalent, talentLogin);

export default talentRouter;
