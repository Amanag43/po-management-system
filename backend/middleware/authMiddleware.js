const { verifyToken } = require('../services/jwtService');

// ─── PROTECT MIDDLEWARE ───────────────────────────────
// This function runs BEFORE route handlers
// It checks if the request has a valid JWT token
// If valid → allow request through
// If invalid → block with 401 error

const protect = (req, res, next) => {
  // STEP 1: Get token from Authorization header
  // Header format: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  // STEP 2: Extract just the token part
  // "Bearer eyJhbGci..." → "eyJhbGci..."
  const token = authHeader.split(' ')[1];

  // STEP 3: Verify the token
  const decoded = verifyToken(token);

  // STEP 4: If token invalid or expired, block request
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.'
    });
  }

  // STEP 5: Attach user info to request object
  // Now any route handler can access req.user
  // e.g. req.user.email, req.user.name
  req.user = decoded;

  // STEP 6: Call next() to proceed to the route handler
  next();
};

module.exports = { protect };