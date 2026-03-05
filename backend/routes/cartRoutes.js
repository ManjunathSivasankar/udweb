const express = require("express");
const router = express.Router();
const {
  getGaraget,
  updateGaragetItem,
  removeFromGaraget,
  clearGaraget,
} = require("../controllers/GaragetController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken); // Protect all Garaget routes

router.get("/", getGaraget);
router.post("/item", updateGaragetItem);
router.delete("/item/:GaragetId", removeFromGaraget);
router.delete("/", clearGaraget);

module.exports = router;
