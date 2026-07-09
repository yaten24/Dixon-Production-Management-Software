const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");
const authMiddleware = require("../middlewares/authMiddleware");

// Login — sets an httpOnly auth cookie on success
router.post("/login", loginController.login);

// Profile — requires a valid session (cookie or bearer token)
router.get("/profile", authMiddleware, loginController.profile);

// Logout — clears the auth cookie
router.post("/logout", authMiddleware, loginController.logout);

module.exports = router;
