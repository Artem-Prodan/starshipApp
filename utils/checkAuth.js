// utils/checkAuth.js
//a function that decides whether secret information can be transmitted.

import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, "secret444");

      req.userId = decoded.id;

      next();
    } catch (err) {
      return res.status(403).json({ message: "No access" });
    }
  } else {
    return res.status(403).json({ message: "No access" });
  }
};
