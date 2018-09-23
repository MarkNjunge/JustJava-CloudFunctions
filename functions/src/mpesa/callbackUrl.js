//@ts-check
const app = require("express")();
const cors = require("cors");

const notificationHelper = require("../utils/notificationHelper");
const {
  getDocumentId,
  saveCompletedPayment,
  saveFailedPayment,
  setOrderToPaid
} = require("../utils/dbHelper");

app.use(cors({ origin: true }));

const parse = require("./parse");

app.post("/:token", (req, res) => {
  console.log("Callback received.");

  const callbackData = req.body.Body.stkCallback;

  console.log(JSON.stringify(callbackData));

  const parsedData = parse(callbackData);

  if (parsedData.resultCode == 0) {
    getDocumentId(parsedData.checkoutRequestID)
      .then(id => saveCompletedPayment(id, parsedData))
      .then(orderId => setOrderToPaid(orderId))
      .then(orderId =>
        notificationHelper.sendMpesaNotification(
          "Your payment was successful.",
          req.params.token,
          orderId,
          "completed"
        )
      )
      .then(() => {
        res.send("Completed");
      })
      .catch(err => {
        console.error(err);
        res.send("Completed");
      });
  } else {
    getDocumentId(parsedData.checkoutRequestID)
      .then(id => saveFailedPayment(id, parsedData))
      .then(orderId =>
        notificationHelper.sendMpesaNotification(
          "Your transaction was not successful.",
          req.params.token,
          orderId,
          "failed"
        )
      )
      .then(() => {
        res.send("Completed");
      })
      .catch(err => {
        console.error(err);
        res.send("Completed");
      });
  }
});

module.exports = app;
