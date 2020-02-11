require("dotenv").config();
const client = require("twilio")(
  process.env.twilio_account_sid,
  process.env.twilio_auth_token
);

const sendMessage = data => {
  let callingString = "";

  for (let i = 0; i < data.calling_points.length; i++) {
    if ([i] < data.calling_points.length - 1) {
      callingString += data.calling_points[i].locationName + ", ";
    } else if ([i] <= data.calling_points.length - 1) {
      callingString += "and " + data.calling_points[i].locationName + ".";
    }
  }

  console.log(data);

  // client.messages
  //   .create({
  //     body:
  //       "The next train from " +
  //       data.origin +
  //       " is the " +
  //       data.std +
  //       " " +
  //       data.operator +
  //       " service to " +
  //       data.destination +
  //       ", calling at " +
  //       callingString,
  //     from: "+447723488652",
  //     to: "+447961239690"
  //   })
  //   .then(message => console.log(message.sid));
};

module.exports = sendMessage;
