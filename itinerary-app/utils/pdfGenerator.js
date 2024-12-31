const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");

exports.generateItineraryPDF = (itinerary, filePath) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333333;
          }

          .container {
            max-width: 900px;
            margin: 20px auto;
            padding: 30px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border: 1px solid #eaeaea;
          }

          header {
            text-align: center;
            margin-bottom: 20px;
          }

          header h1 {
            font-size: 32px;
            color: #0056b3;
            margin-bottom: 8px;
            font-weight: 700;
          }

          header h2 {
            font-size: 20px;
            color: #333333;
            font-weight: 500;
          }

          .user-name {
            font-size: 16px;
            color: #666666;
            margin-top: 5px;
          }

          table.itinerary {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          table.itinerary th {
            background-color: #0056b3;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }

          table.itinerary td {
            padding: 12px;
            background-color: #f9f9f9;
            border: 1px solid #eaeaea;
          }

          table.itinerary tr:nth-child(even) {
            background-color: #f4f4f9;
          }

          table.itinerary tr:hover {
            background-color: #e9f1fa;
          }

          .highlight {
            color: #d9534f;
            font-weight: bold;
          }

          .section-title {
            font-size: 22px;
            color: #0056b3;
            margin-top: 20px;
            border-bottom: 2px solid #0056b3;
            padding-bottom: 5px;
          }

          .info-box {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fc;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid #d9e2ef;
          }

          .places {
            margin-top: 25px;
            padding: 20px;
            background-color: #fff8e5;
            border-radius: 8px;
            border: 1px solid #ffcc80;
          }

          .places h3 {
            font-size: 20px;
            color: #ff9800;
            margin-bottom: 10px;
          }

          .places ul {
            list-style: none;
            padding: 0;
          }

          .places li {
            background-color: #fff3e0;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: 500;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #ffd180;
          }

          .footer, .contact-info {
            text-align: center;
            margin-top: 40px;
            color: #666666;
            font-size: 14px;
          }

          .contact-info a {
            color: #0056b3;
            text-decoration: none;
          }

          .contact-info a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Itinerary Planner</h1>
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

          <div class="info-box">
            <div class="flight-info">
              <h3 class="section-title">Flight Details</h3>
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
              <h3 class="section-title">Hotel Details</h3>
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
            <p>If you have any queries, feel free to contact us!</p>
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
