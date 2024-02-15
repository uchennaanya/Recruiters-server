import express from "express";
import cors from "cors";
import helmet from "helmet";
import sanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import expressLimit from "express-rate-limit";

import CustomError from "./api/utils/CustomError.js";
import errCtrl from "./api/controllers/errorController.js";
import router from "./api/routes/index.js";

const app = express();
let limiter = expressLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many request made",
});

app.use(("/api", limiter));
app.use(helmet());

const whitList = ["https://techwings.netlify.app/", "http://localhost:5173"];

app.use(
  cors({
    origin: whitList,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(sanitize());
app.use(xss());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (reg, res) =>
  res.send({ msg: "Thank you for considering TechWings." })
);

app.all("*", (req, res, next) => {
  const err = new CustomError("In valid URL " + req.originalUrl, 404);
  next(err);
});

app.use(errCtrl);

export default app;
