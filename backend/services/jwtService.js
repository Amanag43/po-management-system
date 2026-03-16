const jwt = require('jsonwebtoken');

// ─── GENERATE TOKEN ───────────────────────────────────
// Creates a JWT token containing user info
// Token expires in 7 days
const generateToken = (user) => {
  // jwt.sign(payload, secret, options)
  // payload = data to store IN the token
  // secret  = used to sign/verify the token
  // options = expiry etc.
  const token = jwt.sign(
    {
      // This data is encoded INTO the token
      // Anyone can READ this (it's base64 encoded)
      // But no one can FAKE it without the secret
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d' // token expires in 7 days
      // Other options: '1h', '30m', '24h'
    }
  );

  return token;
};

// ─── VERIFY TOKEN ─────────────────────────────────────
// Checks if a JWT token is valid and not expired
// Returns the decoded user data if valid
const verifyToken = (token) => {
  try {
    // jwt.verify throws an error if:
    // - token is invalid (tampered with)
    // - token is expired
    // - wrong secret was used
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;

  } catch (error) {
    // Return null if token is invalid
    return null;
  }
};

module.exports = { generateToken, verifyToken };