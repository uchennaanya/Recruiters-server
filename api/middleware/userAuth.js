import jwt from "jsonwebtoken";

export const validateUser = (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.MY_SECRET, (err, decoded) => {
      if (err) {
        console.log(err.message);
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded.user;

      next();
    });
  } else {
    console.log("login to generate atoken");
    return res.status(401).json({ error: "login to generate atoken" });
  }
};
