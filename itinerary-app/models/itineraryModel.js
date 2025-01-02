const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  startPlace: { type: String, required: true },
  endPlace: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  placesToVisit: [
    {
      name: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
  flightDetails: [
    {
      airline: { type: String, required: true },
      flightNumber: { type: String, required: true },
      boardingTime: { type: String, required: true },
      departureTime: { type: String, required: true },
      arrivalTime: { type: String, required: true },
      fromAirport: { type: String, required: true },
      toAirport: { type: String, required: true },
      seatNumber: { type: String },
    },
  ],
  hotelDetails: [
    {
      name: { type: String, required: true },
      address: { type: String, required: true },
      checkIn: { type: String, required: true },
      checkOut: { type: String, required: true },
      rooms: [
        {
          roomNumber: { type: String, required: true },
          occupants: { type: Number, required: true },
        },
      ],
    },
  ],
  coPassengers: [
    {
      name: { type: String },
      relation: { type: String },
      contact: { type: String },
    },
  ],
});

module.exports = mongoose.model("Itinerary", itinerarySchema);
