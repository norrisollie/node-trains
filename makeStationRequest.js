const request = require("request");
const parseString = require("xml2js").parseString;
const stripPrefix = require("xml2js").processors.stripPrefix;
const createSoapMessage = require("./createSoapMessage.js");
const token = require("./token");

const makeStationRequest = (origin, destination, callback) => {
  // create the post options
  const postOptions = {
    url: "https://lite.realtime.nationalrail.co.uk/OpenLDBWS/ldb10.asmx",
    headers: {
      "Content-Type": "text/xml"
    },
    body: createSoapMessage(token, origin, destination),
    method: "POST"
  };

  // make the request to the api
  request(postOptions, function cb(err, res, body) {
    if (err) {
      console.error(err);
    } else {
      parseString(
        body,
        {
          tagNameProcessors: [stripPrefix],
          explicitArray: false,
          ignoreAttrs: true,
          mergeAttrs: false
        },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            let data = result.Envelope.Body;
            if (data.Fault) {
              callback("Something went wrong");
            } else {
              callback(data);
            }
          }
        }
      );
    }
  });
};

module.exports = makeStationRequest;
