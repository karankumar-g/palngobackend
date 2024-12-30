const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

exports.generateItineraryPDF = (itinerary, filePath) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          /* General Styles */
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f0f8ff;
            color: #333;
          }

          .container {
            max-width: 900px;
            margin: 20px auto;
            padding: 40px;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border-top: 5px solid #007BFF;
          }

          header {
            text-align: center;
            margin-bottom: 30px;
          }

          header h1 {
            font-size: 40px;
            color: #ff6347;
            margin-bottom: 10px;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          }

          header h2 {
            font-size: 28px;
            color: #20b2aa;
            font-weight: 600;
          }

          .user-name {
            font-size: 22px;
            color: #ff4500;
            margin-top: 15px;
          }

          table.itinerary {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }

          table.itinerary th {
            background-color: #007BFF;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }

          table.itinerary td {
            padding: 12px;
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
          }

          table.itinerary tr:nth-child(even) {
            background-color: #e9ecef;
          }

          table.itinerary tr:hover {
            background-color: #dfe4ea;
          }

          .highlight {
            color: #dc3545;
            font-weight: bold;
          }

          .flight-hotel {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #007BFF;
          }

          .flight-info, .hotel-info {
            width: 48%;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            background-color: #e3f2fd;
          }

          .places {
            margin-top: 30px;
            padding: 25px;
            background-color: #e3f2fd;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .places h3 {
            font-size: 24px;
            color: #ff5733;
            margin-bottom: 15px;
            text-decoration: underline;
          }

          .places ul {
            list-style: none;
            padding: 0;
          }

          .places li {
            background-color: #ffecd1;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
          }

          .footer, .contact-info {
            text-align: center;
            margin-top: 40px;
            color: #6c757d;
            font-size: 16px;
          }

          .contact-info a {
            color: #007BFF;
            text-decoration: none;
            font-weight: bold;
          }

          .contact-info a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Itinerary Details</h1>
            <h2>Trip: ${itinerary.startPlace} to ${itinerary.endPlace}</h2>
            <p class="user-name">Welcome, ${itinerary.username}!</p>
          </header>

          <table class="itinerary">
            <tr><th>Start Date</th><td>${new Date(
              itinerary.startDate
            ).toLocaleDateString()}</td></tr>
            <tr><th>End Date</th><td>${new Date(
              itinerary.endDate
            ).toLocaleDateString()}</td></tr>
            <tr><th>Flight</th><td class="highlight">${
              itinerary.flightDetails[0].airline
            } Flight ${itinerary.flightDetails[0].flightNumber}</td></tr>
            <tr><th>Hotel</th><td>${itinerary.hotelDetails[0].name}</td></tr>
            <tr><th>Co-passengers</th><td>${itinerary.coPassengers
              .map((p) => p.name)
              .join(", ")}</td></tr>
          </table>

          <div class="flight-hotel">
            <div class="flight-info">
              <h3>Flight Information</h3>
              <p><strong>Departure:</strong> ${new Date(
                itinerary.flightDetails[0].departureTime
              ).toLocaleString()}</p>
              <p><strong>Arrival:</strong> ${new Date(
                itinerary.flightDetails[0].arrivalTime
              ).toLocaleString()}</p>
              <p><strong>From:</strong> ${
                itinerary.flightDetails[0].fromAirport
              } - <strong>To:</strong> ${
    itinerary.flightDetails[0].toAirport
  }</p>
            </div>
            <div class="hotel-info">
              <h3>Hotel Information</h3>
              <p><strong>Name:</strong> ${itinerary.hotelDetails[0].name}</p>
              <p><strong>Address:</strong> ${
                itinerary.hotelDetails[0].address
              }</p>
            </div>
          </div>

          <div class="places">
            <h3>Places to Visit</h3>
            <ul>
              ${itinerary.placesToVisit
                .map(
                  (place) =>
                    `<li>${place.name} <span>(From: ${new Date(
                      place.startTime
                    ).toLocaleTimeString()} To: ${new Date(
                      place.endTime
                    ).toLocaleTimeString()})</span></li>`
                )
                .join("")}
            </ul>
          </div>

          <div class="footer">
            <p>If you need further assistance, feel free to contact us.</p>
          </div>
          <div class="contact-info">
            <p><strong>Company:</strong> Plango</p>
            <p><strong>Contact:</strong> 9345543332</p>
            <p><strong>Email:</strong> <a href="mailto:plango@gmail.com">plango@gmail.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    pdf.create(htmlContent, { format: "A4" }).toFile(filePath, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};
