const express = require("express");
const upload = require("../middleware/upload");

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "profile_photo",
      maxCount: 1
    },
    {
      name: "id_card_photo",
      maxCount: 1
    }
  ]),
  registerUser
);

router.post("/login", loginUser);

module.exports = router;