const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "token";

// FIX: token is now read from the httpOnly cookie set at login, not from
// an Authorization header — the frontend no longer needs to manually
// attach a bearer token (and can't accidentally leak it via JS). A
// Bearer header fallback is kept so non-browser clients (mobile apps,
// server-to-server calls, Postman) that can't rely on cookies still work.
module.exports = (req, res, next) => {
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.split(" ")[1];
  console.log(req.cookies);

  console.log("authMiddleware: cookieToken:", cookieToken);

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access Denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    // FIX: distinguish an expired token from a genuinely invalid one so
    // the frontend can tell "please log in again" apart from "tampered
    // token" if it ever needs to (e.g. auto-redirect to login on expiry).
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired, please log in again"
        : "Invalid token";

    res.status(401).json({
      success: false,
      message,
    });
  }
};
