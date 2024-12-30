const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    if (!token) {
      return res
        .status(401)
        .json({ msg: "Token missing in authorization header" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Verification Error:", err.message);
        return res
          .status(401)
          .json({ msg: "Unauthorized: Invalid or expired token" });
      }

      console.log("Decoded Token Payload:", decoded);
      req.user = { id: decoded.id };
      next();
    });
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
