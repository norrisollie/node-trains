const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const parseString = require("xml2js").parseString;
const stripPrefix = require("xml2js").processors.stripPrefix;
require("dotenv").config();
const csv = require("csv-parser");
const fs = require("fs");

const app = express();

app.set("static", "/");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(express.static("public"));

const generateRequestEnvelope = (origin, destination) => {
  console.log("creating soap request envelope");

  let xml =
    "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:typ='http://thalesgroup.com/RTTI/2013-11-28/Token/types' xmlns:ldb='http://thalesgroup.com/RTTI/2017-10-01/ldb/'>";
  xml += "<soapenv:Header>";
  xml += "<typ:AccessToken>";
  xml += "<typ:TokenValue>" + process.env.nr_token + "</typ:TokenValue>";
  xml += "</typ:AccessToken>";
  xml += "</soapenv:Header>";
  xml += "<soapenv:Body>";
  xml += "<ldb:GetArrDepBoardWithDetailsRequest>";
  xml += "<ldb:numRows>10</ldb:numRows>";
  xml += "<ldb:crs>" + origin.toUpperCase() + "</ldb:crs>";
  xml += "<ldb:filterCrs>" + destination.toUpperCase() + "</ldb:filterCrs>";
  xml += "<ldb:filterType>to</ldb:filterType>";
  xml += "<ldb:timeOffset>0</ldb:timeOffset>";
  xml += "<ldb:timeWindow>120</ldb:timeWindow>";
  xml += "</ldb:GetArrDepBoardWithDetailsRequest>";
  xml += "</soapenv:Body>";
  xml += "</soapenv:Envelope>";

  return xml;
};

const makeStationReq = (origin, destination, callback) => {
  console.log("making station request");

  axios
    .post(
      "https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx",
      generateRequestEnvelope(origin, destination),
      {
        headers: { "Content-Type": "text/xml" }
      }
    )
    .then(res => {
      parseString(
        res.data,
        {
          tagNameProcessors: [stripPrefix],
          explicitArray: false,
          ignoreAttrs: true,
          mergeAttrs: true
        },
        (err, result) => {
          if (err) {
            console.log("couldn't parse XML");
          } else {
            let data = result.Envelope.Body;
            if (data.Fault) {
              console.log("API Fault");
            } else {
              console.log("Request successfull");
              callback(data);
            }
          }
        }
      );
    })
    .catch(err => {
      console.log(err);
    });
};

// home page
app.get("/", (req, res) => {
  res.render("layouts/index");
});

// form action
app.get("/times", (req, res) => {
  const { origin, destination } = req.query;
  // res.redirect("/" + origin + "/" + destination);
});

app.get("/:origin/:destination", (req, res) => {
  const { origin, destination } = req.params;

  makeStationReq(origin, destination, data => {
    const results =
      data.GetArrDepBoardWithDetailsResponse.GetStationBoardResult;

    try {
      const messages = results.nrccMessages;
      const services = results.trainServices.service;

      let showResults = true;
      res.render("layouts/index", {
        showResults: showResults,
        origin: origin,
        destination: destination,
        services: services
      });
    } catch (err) {
      var error = true;
      res.render("layouts/index", {
        error: error
      });
    }
  });
});

app.listen(8000);
