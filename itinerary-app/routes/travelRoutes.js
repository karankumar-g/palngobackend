const express = require("express");
const { getTravelDetails } = require("../controllers/travelController");

const router = express.Router();

// Route for fetching travel details
router.post("/travel-details", getTravelDetails);

module.exports = router;
