const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const makeStationRequest = require("./makeStationRequest.js");
const sendMessage = require("./sendMessage.js");

const MessagingResponse = require("twilio").twiml.MessagingResponse;

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "pug");

app.set("views", "./views");

// get request for the crs codes
app.get("/:origin/:destination", (req, res) => {
  const origin = req.params.origin;
  const destination = req.params.destination;

  const receiveData = data => {
    const departureData =
      data.GetNextDeparturesWithDetailsResponse.DeparturesBoard;

    let smsData = {
      origin: departureData.locationName,
      std: departureData.departures.destination.service.std,
      etd: departureData.departures.destination.service.etd,
      operator: departureData.departures.destination.service.operator,
      platform: departureData.departures.destination.service.platform,
      destination:
        departureData.departures.destination.service.destination.location
          .locationName,
      calling_points:
        departureData.departures.destination.service.subsequentCallingPoints
          .callingPointList.callingPoint
    };

    sendMessage(smsData);

    // res.render("index", {
    //   origin: origin_name,
    //   std: departure_std,
    //   destination: destination_name,
    //   via: destination_via
    // });
  };

  makeStationRequest(origin, destination, receiveData);
});

app.post("/sms", (req, res) => {
  // read the reply to message
  const response = req.body.Body;
  const splitResponse = response.split("to");
  const from = splitResponse[0].trim().toUpperCase();
  const to = splitResponse[1].trim().toUpperCase();

  console.log(from + " to " + to);

  makeStationRequest(from, to, function(data) {
    const departureData =
      data.GetNextDeparturesWithDetailsResponse.DeparturesBoard;

    let smsData = {
      origin: departureData.locationName,
      std: departureData.departures.destination.service.std,
      etd: departureData.departures.destination.service.etd,
      operator: departureData.departures.destination.service.operator,
      platform: departureData.departures.destination.service.platform,
      destination:
        departureData.departures.destination.service.destination.location
          .locationName,
      calling_points:
        departureData.departures.destination.service.subsequentCallingPoints
          .callingPointList.callingPoint
    };

    let callingString = "";

    for (let i = 0; i < smsData.calling_points.length; i++) {
      if ([i] < smsData.calling_points.length - 1) {
        callingString += smsData.calling_points[i].locationName + ", ";
      } else if ([i] <= smsData.calling_points.length - 1) {
        callingString += "and " + smsData.calling_points[i].locationName + ".";
      }
    }

    const message =
      "The next train from " +
      smsData.origin +
      " to " +
      smsData.destination +
      " is the " +
      smsData.std +
      " " +
      smsData.operator +
      " service, departing from platform " +
      smsData.platform +
      ". " +
      "This train calls at " +
      callingString;

    const twiml = new MessagingResponse();

    twiml.message(message);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  });

  //   console.log();

  //   console.log(from + " to " + to);

  //   makeStationRequest(from, to, sendMessage);
});

app.listen("8000");
