const express = require("express");

const {
  getPendingUsers,
  verifyUser
} = require("../controllers/adminController");

const {
  protect,
  adminOnly
} = require("../middleware/auth");

const router = express.Router();

router.get(
  "/pending-users",
  protect,
  adminOnly,
  getPendingUsers
);

router.put(
  "/verify/:id",
  protect,
  adminOnly,
  verifyUser
);

module.exports = router;