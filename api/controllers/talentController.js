import Talent from "../models/talentModel.js";
import jwt from "jsonwebtoken";

import * as dotenv from 'dotenv'
dotenv.config();

export const createTalent = async (req, res) => {
  try {
    let talentExist = await Talent.findOne({
      talentEmail: req.body.talentEmail,
    });
    if (talentExist) {
      return res.json({
        message: "Error!",
        response: "Talent with username already exist",
      });
    } else {
      const newTalent = new Talent(req.body);

      let savedTalent = await newTalent.save();

      let talentPayLoad = {
        talentNames: savedTalent.talentNames,
        talentEmail: savedTalent.TalentEmail,
      };

      const TalentToken = jwt.sign(talentPayLoad, process.env.SECRETKEY);

      return res.send({
        message: "Saved",
        userData: {
          regCode: savedTalent.regCode,
          TalentToken,
        },
      });
    }
  } catch (err) {
    console.log(err.name);
    return res.status(500).send({
      msg: err.message,
      status: 500,
    });
  }
};

export const talentLogin = async (req, res) => {
  const { regCode, password } = req.body;
  if (!regCode || !password) {
    return res.status(400).send({ message: "Missing required fields" });
  }
  const Talent = await Talent.findOne({ regCode: req.body.regCode });

  if (Talent == null)
    return res.status(400).send({ message: "User not found!" });
  try {
    if (Talent.comparePassword(req.body.password, Talent.password)) {
      let loggedInPayload = { TalentEmail: Talent.TalentEmail };
      const loginToken = jwt.sign(loggedInPayload, process.env.SECRETKEY);

      res.send({
        success: true,
        Talent: {
          id: Talent._id,
          name: Talent.TalentNames,
        },
        token: loginToken,
        message: "User logged in",
      });
    } else {
      res.status(400).send({ message: "Invalid credentials!" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server error", reason: error.message });
  }
};

export const getTalents = async (req, res) => {
  try {
    let getTalents = await Talent.find({});
    if (getTalents === true) console.log("Table is empty ");
    return res.json({
      message: "Success!",
      response: getTalents,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      msg: err.message,
      status: 500,
    });
  }
};

export const getTalent = async (req, res) => {
  try {
    let getTalents = await Talent.findOne({ _id: req.params.id });
    return res.json({
      message: "Success!",
      response: getTalents,
    });
  } catch (err) {
    console.log(err.name);
    res.status(500).send({
      msg: err.message,
      status: 500,
    });
  }
};

export const updateTalent = async (req, res) => {
  try {
    let {
      TalentNames,
      TalentPhone,
      regCode,
      TalentAddress,
      courseDuration,
      courseOfTaly,
      guardianName,
      relationship,
      trainingFees,
      amountDeposited,
      balance,
      gender,
    } = req.body;
    let updated = await Talent.findByIdAndUpdate(
      req.params.id,
      {
        TalentNames,
        TalentPhone,
        regCode,
        TalentAddress,
        courseDuration,
        courseOfTaly,
        guardianName,
        relationship,
        trainingFees,
        amountDeposited,
        balance,
        gender,
      },
      { new: true }
    );
    return res.json({
      message: "Success!",
      response: updated,
    });
  } catch (err) {
    console.log(err.name);
    return res.json({
      message: err.message,
      response: "Fail to update",
    });
  }
};

export const deleteTalent = async (req, res) => {
  try {
    let deleteTalent = await Talent.findByIdAndDelete({ _id: req.params.id });
    return res.json({
      message: "Success",
      response: deleteTalent,
    });
  } catch (err) {
    console.log(err.name);
    return res.json({
      message: err.message,
      response: "Fail to update",
    });
  }
};
