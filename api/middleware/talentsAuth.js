import jwt from 'jsonwebtoken'

export const validateTalent = () => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.MY_SECRET, (err, decoded) => {
      if (err) {
        console.log(err.message);
        return res.status(401).json({ error: "Token is invalid" });
      }
      req.user = decoded.user;

      next();
    });
  } else {
    console.log("A token is needed");
    return res.status(401).json({ error: "Token is needed" });
  }
};
