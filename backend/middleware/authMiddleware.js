import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", error: error.message });
  }
};

// Check if user has specific role
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.type)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

// Generate JWT token
export const generateToken = (user, type) => {
  const payload = {
    _id: user._id,
    email: user.email,
    type: type // 'admin', 'instructor', 'student'
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });
  return token;
};

export default { verifyToken, checkRole, generateToken };
