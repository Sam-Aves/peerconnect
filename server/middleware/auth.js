const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly
};