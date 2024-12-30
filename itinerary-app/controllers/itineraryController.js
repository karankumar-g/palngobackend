const Itinerary = require("../models/itineraryModel");
const path = require("path");
const fs = require("fs");
const { generateItineraryPDF } = require("../utils/pdfGenerator");
const User = require("../models/userModel");

// Create Itinerary (POST request)

exports.createItinerary = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const itinerary = new Itinerary({
      userId: req.user.id,
      username: user.name,
      ...req.body,
    });

    await itinerary.save();
    res.status(201).json({ msg: "Itinerary created successfully", itinerary });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Get All Itineraries for a Specific User (GET request)
exports.getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user.id });
    if (!itineraries.length) {
      return res.status(404).json({ msg: "No itineraries found" });
    }
    res.status(200).json(itineraries);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Get Specific Itinerary by ID (GET request)
exports.getItineraryById = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary || itinerary.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ msg: "Itinerary not found or access denied" });
    }
    res.status(200).json(itinerary);
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Update Itinerary (PATCH request)
exports.updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      return res.status(404).json({ msg: "Itinerary not found" });
    }

    res.status(200).json({ msg: "Itinerary updated successfully", itinerary });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Delete Itinerary (DELETE request)
exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ msg: "Itinerary not found" });
    }

    res.status(200).json({ msg: "Itinerary deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Download Itinerary PDF (GET request)
exports.downloadItineraryPDF = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary || itinerary.userId.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ msg: "Itinerary not found or access denied" });
    }

    const filePath = path.join(
      __dirname,
      "../uploads",
      `itinerary_${itinerary._id}.pdf`
    );

    await generateItineraryPDF(itinerary, filePath);

    res.download(filePath, `itinerary_${itinerary._id}.pdf`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      } else {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};
