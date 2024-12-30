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
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  placesToVisit: [
    {
      name: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },
  ],
  flightDetails: [
    {
      airline: { type: String, required: true },
      flightNumber: { type: String, required: true },
      boardingTime: { type: Date, required: true },
      departureTime: { type: Date, required: true },
      arrivalTime: { type: Date, required: true },
      fromAirport: { type: String, required: true },
      toAirport: { type: String, required: true },
      seatNumber: { type: String },
    },
  ],
  hotelDetails: [
    {
      name: { type: String, required: true },
      address: { type: String, required: true },
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
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
