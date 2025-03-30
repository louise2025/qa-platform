const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
  // Get token from header - check both formats
  let token = req.header("x-auth-token")

  // If no x-auth-token, check Authorization header
  if (!token) {
    const authHeader = req.header("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Add user from payload to request
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

