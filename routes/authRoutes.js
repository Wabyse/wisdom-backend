const express = require("express");
const { login, signup, adminSignup, adminLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);

module.exports = router;
