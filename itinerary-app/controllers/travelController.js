const crypto = require("crypto");

function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => deg * (Math.PI / 180);

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

function generateFlightID() {
  return crypto.randomUUID();
}

function generateFlightData(source, destination, date, passengers) {
  const coordinates = {
    source: { lat: 12.9716, lon: 77.5946 },
    destination: { lat: 19.076, lon: 72.8777 },
  };

  const distance = calculateDistance(
    coordinates.source.lat,
    coordinates.source.lon,
    coordinates.destination.lat,
    coordinates.destination.lon
  );

  const basePricePerKm = 3;
  const basePrice = Math.max(1000, distance * basePricePerKm);

  const providers = [
    {
      name: "Goibibo",
      website: "https://www.goibibo.com",
      price: Math.round(basePrice * passengers * (1 + Math.random() * 0.1)),
    },
    {
      name: "MakeMyTrip",
      website: "https://www.makemytrip.com",
      price: Math.round(basePrice * passengers * (1 + Math.random() * 0.12)),
    },
    {
      name: "Cleartrip",
      website: "https://www.cleartrip.com",
      price: Math.round(basePrice * passengers * (1 + Math.random() * 0.08)),
    },
  ];

  return {
    flight_id: generateFlightID(),
    source,
    destination,
    date,
    passengers,
    distance,
    providers,
  };
}

function generateHotelData(
  destination,
  flightDate,
  distance,
  checkOutDate,
  adults,
  kids
) {
  const averageSpeed = 800;
  const travelTime = distance / averageSpeed;
  const flightDateObj = new Date(flightDate);
  flightDateObj.setHours(flightDateObj.getHours() + travelTime);
  const checkInDate = flightDateObj.toISOString().split("T")[0];

  const checkOutDateFormatted = new Date(checkOutDate)
    .toISOString()
    .split("T")[0];

  const roomCapacity = 3;
  const roomForAdults = Math.ceil(adults / roomCapacity);
  const roomForKids = Math.ceil(kids / 2);
  const totalRooms = Math.max(roomForAdults, roomForKids);

  const perRoomPrice = 5000; // Price for 1 room per day
  const totalStayPrice = perRoomPrice * totalRooms;

  const hotels = [
    {
      name: "Hotel Sunshine",
      address: "123 Main Street, Sunshine City",
      phone: "123456789",
      price_per_day: perRoomPrice,
      total_stay_price: totalStayPrice,
    },
    {
      name: "Ocean View Hotel",
      address: "456 Beach Road, Ocean City",
      phone: "987654321",
      price_per_day: perRoomPrice + 1000, // Slightly more expensive for this hotel
      total_stay_price: (perRoomPrice + 1000) * totalRooms,
    },
    {
      name: "Mountain Retreat",
      address: "789 Hilltop Drive, Mountain City",
      phone: "456789123",
      price_per_day: perRoomPrice - 500, // Slightly cheaper for this hotel
      total_stay_price: (perRoomPrice - 500) * totalRooms,
    },
  ];

  return {
    destination,
    checkInDate,
    checkOutDate: checkOutDateFormatted,
    rooms: totalRooms,
    hotels,
  };
}

exports.getTravelDetails = (req, res) => {
  const { source, destination, date, passengers, checkOutDate, adults, kids } =
    req.body;

  if (
    !source ||
    !destination ||
    !date ||
    !passengers ||
    !checkOutDate ||
    adults === undefined ||
    kids === undefined
  ) {
    return res.status(400).json({
      error:
        "Source, destination, date, passengers, checkOutDate, adults, and kids are required.",
    });
  }

  if (passengers !== adults + kids) {
    return res.status(400).json({
      error: "The passengers count must equal the sum of adults and kids.",
    });
  }

  const flightDetails = generateFlightData(
    source,
    destination,
    date,
    passengers
  );
  const hotelDetails = generateHotelData(
    destination,
    date,
    flightDetails.distance,
    checkOutDate,
    adults,
    kids
  );

  res.json({ flightDetails, hotelDetails });
};
