const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../config/passport'); // Import passport configuration
const { generateToken } = require('../services/jwtService');

// ─── STEP 1: INITIATE GOOGLE LOGIN ────────────────────
// GET /auth/google
// When user clicks "Login with Google" this route fires
// It redirects the browser to Google's login page
router.get('/google',
  passport.authenticate('google', {
    // Scopes = what info we want from Google
    scope: ['profile', 'email'],
    // profile = name, photo
    // email = email address
    session: false // we use JWT not sessions
  })
);

// ─── STEP 2: GOOGLE CALLBACK ──────────────────────────
// GET /auth/google/callback
// Google redirects HERE after user logs in
// This URL must match Google Cloud Console exactly
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failed' // if login fails
  }),

  // This function runs ONLY if Google login succeeded
  (req, res) => {
    // req.user contains the user object from passport strategy
    const user = req.user;

    // Generate our own JWT token
    const token = generateToken(user);
 res.redirect('/auth-success.html?token=${token}'); 

  }
);

// ─── AUTH SUCCESS ─────────────────────────────────────
// GET /auth/success
// Returns current user info from JWT
// Frontend calls this to get user details
router.get('/success', (req, res) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1]; // get token after "Bearer "
  const { verifyToken } = require('../services/jwtService');
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.avatar
    }
  });
});

// ─── AUTH FAILED ──────────────────────────────────────
router.get('/failed', (req, res) => {
  res.status(401).json({
    success: false,
    error: 'Google authentication failed'
  });
});

// ─── LOGOUT ───────────────────────────────────────────
// GET /auth/logout
// Since we use JWT (stateless), logout is handled on frontend
// Frontend just deletes the token from localStorage
router.get('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete your token.'
  });
});

module.exports = router;
