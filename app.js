const express = require("express");
const makeStationRequest = require("./makeStationRequest.js");
const app = express();

app.set("view engine", "pug");

app.set("views", "./views");

// get request for the crs codes
app.get("/:origin/:destination", (req, res) => {
  console.log(req.params);
  const origin = req.params.origin;
  const destination = req.params.destination;

  const receiveData = data => {
    const departureData =
      data.GetNextDeparturesWithDetailsResponse.DeparturesBoard;

    console.log(
      departureData.departures.destination.service.subsequentCallingPoints
        .callingPointList.callingPoint
    );

    const origin_name = departureData.locationName,
      destination_name =
        departureData.departures.destination.service.destination.location
          .locationName,
      destination_via =
        departureData.departures.destination.service.destination.location.via,
      departure_std = departureData.departures.destination.service.std;

    console.log();

    res.render("index", {
      origin: origin_name,
      std: departure_std,
      destination: destination_name,
      via: destination_via
    });
  };

  makeStationRequest(origin, destination, receiveData);
});

app.listen("8000");
