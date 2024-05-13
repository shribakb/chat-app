const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  editUser,
  deleteUser,
  statusUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;
// router.post("/login", authUser);
router.route("/edit").put(protect, editUser);
router.route("/delete").put(protect, deleteUser);
router.route("/status").put(protect, statusUser);
