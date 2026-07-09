const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Login = require("../models/loginModel");

// ==========================================================
// Cookie config — centralised so login/logout always agree on
// the exact same options (a mismatch here is the #1 cause of
// "logout doesn't actually clear the cookie" bugs).
// ==========================================================
const isProduction = process.env.NODE_ENV === "production";

const AUTH_COOKIE_NAME = "token";

const cookieOptions = {
  httpOnly: true, // Prevent JavaScript from accessing the cookie
  secure: false, // false for localhost (HTTP)
  sameSite: "lax", // Works well for same-site requests during development
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// A pre-computed dummy hash used when no user is found, so bcrypt.compare
// still runs and takes the same amount of time as a real comparison.
// FIX: without this, a failed lookup returns instantly while a wrong
// password takes ~100ms for bcrypt — that timing difference lets an
// attacker enumerate valid employee IDs. This closes that gap.
const DUMMY_HASH =
  "$2b$10$CwTycUXWue0Thq9StjUM0uJ8mMYYX8/L4WgKzC2FGDh0v6d2hOdLK";

exports.login = async (req, res) => {
  try {
    const employeeId = req.body.employeeId?.trim();
    const password = req.body.password;
    console.log("Login attempt:", {
      employeeId,
      password: password ? "****" : null,
    });
    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Password are required",
      });
    }

    const user = await Login.findByEmployeeId(employeeId);

    // FIX: compare against a dummy hash even when the user doesn't exist,
    // so response timing is identical for "no such employee ID" vs "wrong
    // password" — prevents user enumeration via timing attacks.
    const match = await bcrypt.compare(
      password,
      user ? user.password : DUMMY_HASH,
    );

    // FIX: single generic message for both "no user" and "wrong password".
    // Telling an attacker which one failed lets them enumerate valid IDs.
    if (!user || !match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Employee ID or Password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact your administrator.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        employeeId: user.employee_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // keep in sync with cookieOptions.maxAge
    );

    // FIX: token now lives in an httpOnly cookie instead of the response
    // body. It's never touched by client-side JS, so an XSS bug can no
    // longer exfiltrate it from localStorage/sessionStorage.
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

    res.json({
      success: true,
      message: "Login Successful",
      user: {
        id: user.id,
        name: user.name,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      success: false,
      // FIX: never leak raw error messages (stack traces, SQL errors, etc.)
      // to the client in production — only in local/dev for debugging.
      message: isProduction
        ? "Something went wrong. Please try again."
        : err.message,
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await Login.getById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);

    res.status(500).json({
      success: false,
      message: isProduction
        ? "Something went wrong. Please try again."
        : err.message,
    });
  }
};

exports.logout = async (req, res) => {
  // FIX: clearCookie must be called with the *same* options (path,
  // sameSite, secure) used when the cookie was set, or the browser will
  // silently ignore the clear and the user stays logged in.
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  res.json({
    success: true,
    message: "Logout Successful",
  });
};
