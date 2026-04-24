import jwt from "jsonwebtoken";

// ✅ Generate Token
export const generateToken = (user, type) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    type: type
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d"
  });
};

// ✅ Verify Token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message
    });
  }
};

export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.type)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions"
      });
    }

    next();
  };
};