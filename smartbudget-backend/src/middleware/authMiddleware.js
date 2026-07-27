

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({
    success: false,
    message: "Authorization token required",
  });
}
const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.type !== "access"){
 return res.status(401).json({
   message:"Invalid token type"
 });
}

    const user = await User.findById(decoded.id).select("-password");

    // if (!user) {
    //   return res.status(401).json({ message: "User not found" });
    // }

    if (!user) {
  return res.status(401).json({
    success: false,
    message: "User not found",
  });
}

if (!user.isEmailVerified) {
  return res.status(403).json({
    success: false,
    message: "Please verify your email before continuing.",
  });
}

req.user = user;

next();
  

    req.user = user; // ✅ STANDARDIZED

    next();
 } catch (err) {

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Authentication failed.",
  });
}

}

export default protect;