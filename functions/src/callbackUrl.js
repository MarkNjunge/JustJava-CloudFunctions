const admin = require("firebase-admin");
const app = require("express")();
const cors = require("cors");

const notificationHelper = require("./notificationHelper");

app.use(cors({ origin: true }));

const parse = require("./parse");

const db = admin.database();

app.post("/:token", (req, res) => {
  console.log("Callback received.");

  const callbackData = req.body.Body.stkCallback;

  console.log(JSON.stringify(callbackData));

  const parsedData = parse(callbackData);

  if (parsedData.resultCode == 0) {
    notificationHelper.sendMpesaNotification(
      "Your payment was successful.",
      req.params.token
    );
    db.ref("LNM/successful").push(parsedData, error => {
      if (error) {
        console.log(error);
      } else {
        console.log("Transaction saved to database.");
      }
    });
  } else {
    notificationHelper.sendMpesaNotification(
      "Your transaction was not successful.",
      req.params.token
    );
    db.ref("LNM/failed").push(parsedData, err => {
      if (err) {
        console.log(err);
      } else {
        console.log("Transaction saved to database.");
      }
    });
  }
  res.send("Completed");
});

module.exports = app;
