const express = require("express");
const {
  createItinerary,
  getItineraries,
  getItineraryById,
  downloadItineraryPDF,
  shareItineraryByEmail,
} = require("../controllers/itineraryController");
const { authenticate } = require("../utils/jwt");

const router = express.Router();

// Create itinerary
router.post("/", authenticate, createItinerary);

// Get all itineraries for the user
router.get("/", authenticate, getItineraries);

// Get a particular itinerary by ID
router.get("/:id", authenticate, getItineraryById);

// Download itinerary as PDF
router.get("/:id/download", authenticate, downloadItineraryPDF);

router.post("/:id/share", authenticate, shareItineraryByEmail);

module.exports = router;
