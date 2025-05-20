const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, "A_very_long_string_for_our_secret");

    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Auth Failed" });
  }
};