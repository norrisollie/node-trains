const createSoapMessage = (
  accessToken,
  departureStationCode,
  destinationStationCode
) => {
  let message =
    '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:typ="http://thalesgroup.com/RTTI/2013-11-28/Token/types" xmlns:ldb="http://thalesgroup.com/RTTI/2017-02-02/ldb/">';
  message += " <soap:Header>";
  message += "<typ:AccessToken>";
  message += "<typ:TokenValue>" + accessToken + "</typ:TokenValue>";
  message += "</typ:AccessToken>";
  message += " </soap:Header>";
  message += " <soap:Body>";
  message += "<ldb:GetNextDeparturesWithDetailsRequest>";
  message += "<ldb:crs>" + departureStationCode.toUpperCase() + "</ldb:crs>";
  message += "<ldb:filterList>";
  message += "<ldb:crs>" + destinationStationCode.toUpperCase() + "</ldb:crs>";
  message += "</ldb:filterList>";
  message += "<ldb:timeOffset>0</ldb:timeOffset>";
  message += "<ldb:timeWindow>120</ldb:timeWindow>";
  message += "</ldb:GetNextDeparturesWithDetailsRequest>";
  message += " </soap:Body>";
  message += "</soap:Envelope>";

  return message;
};

module.exports = createSoapMessage;
