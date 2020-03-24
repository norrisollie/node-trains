const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const parseString = require("xml2js").parseString;
require("dotenv").config();

const app = express();

app.set("static", "/");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(express.static("public"));

// soap request for train data
// const url =
//   "https://realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2017-10-01";
// const args = {
//   ["typ:TokenValue"]: process.env.nr_token
// };

// soap.createClient(url, (err, client) => {
//   client.addSoapHeader(
//     "<soapenv:Header><typ:AccessToken><typ:TokenValue>" +
//       process.env.nr_token +
//       "</typ:TokenValue></typ:AccessToken></soapenv:Header>"
//   );

//   client.GetDepBoardWithDetails(args, (err, res) => {
//     console.log(client);
//   });
// });
xmls =
  "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:typ='http://thalesgroup.com/RTTI/2013-11-28/Token/types' xmlns:ldb='http://thalesgroup.com/RTTI/2017-10-01/ldb/'>";
xmls += "   <soapenv:Header>";
xmls += "      <typ:AccessToken>";
xmls +=
  "         <typ:TokenValue>" + process.env.nr_token + "</typ:TokenValue>";
xmls += "      </typ:AccessToken>";
xmls += "   </soapenv:Header>";
xmls += "   <soapenv:Body>";
xmls += "      <ldb:GetArrDepBoardWithDetailsRequest>";
xmls += "         <ldb:numRows>100</ldb:numRows>";
xmls += "         <ldb:crs>LES</ldb:crs>";
xmls += "         <ldb:filterCrs>FST</ldb:filterCrs>";
xmls += "         <ldb:filterType>to</ldb:filterType>";
xmls += "         <ldb:timeOffset>0</ldb:timeOffset>";
xmls += "         <ldb:timeWindow>120</ldb:timeWindow>";
xmls += "      </ldb:GetArrDepBoardWithDetailsRequest>";
xmls += "   </soapenv:Body>";
xmls += "</soapenv:Envelope>";

axios
  .post("https://realtime.nationalrail.co.uk/OpenLDBWS/ldb11.asmx", xmls, {
    headers: { "Content-Type": "text/xml" }
  })
  .then(res => {
    const data = res.data;
    parseString(data, { trim: true }, function(err, res) {
      console.log(res);
    });
  })
  .catch(err => {
    console.log(err);
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
