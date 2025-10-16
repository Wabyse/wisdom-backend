const express = require("express");
const { login, signup, adminSignup, adminLogin, signupBulk, ebdaEdulogin } = require("../controllers/authController");

const router = express.Router();

router.post("/iees/login", ebdaEdulogin);
router.post("/login", login);
router.post("/signup", signup);
router.post("/bulk/signup", signupBulk);
router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);

module.exports = router;
