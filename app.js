const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const soap = require("soap");
require("dotenv").config();

const app = express();

app.set("static", "/");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(express.static("public"));

// soap request for train data
const url =
  "https://realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01";
const args = {
  ["typ:TokenValue"]: process.env.nr_token
};

soap.createClient(url, (err, client) => {
  client.addSoapHeader(
    "<soapenv:Header><typ:AccessToken><typ:TokenValue>" +
      process.env.nr_token +
      "</typ:TokenValue></typ:AccessToken></soapenv:Header>"
  );

  client.GetDepBoardWithDetails(args, (err, res) => {
    console.log(client);
  });
});

// home page
app.get("/", (req, res) => {
  res.render("layouts/index");
});

// form action
app.get("/times", (req, res) => {
  const { origin, destination } = req.query;
  res.redirect("/" + origin + "/" + destination);
});

app.get("/:origin/:destination", (req, res) => {
  const { origin, destination } = req.params;
  let showResults = true;
  res.render("layouts/index", {
    showResults: showResults,
    origin: origin,
    destination: destination
  });
});

app.listen(8000);
