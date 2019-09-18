//@ts-check
const app = require("express")();
const cors = require("cors");
const axios = require("axios").default;

const notificationUtils = require("./utils/notification-utils");
const dbUtils = require("./utils/db-utils");
const config = require("./config");

app.use(cors({ origin: true }));

const mpesaUtils = require("./utils/mpesa-utils");

const apiKeyMiddleware = (req, res, next) => {
  const reqApiKey = req.header("ApiKey");
  if (!reqApiKey || reqApiKey != config.apiKey) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  next();
};

// Kept for legacy
app.post("/request", apiKeyMiddleware, async (req, res) => {
  res.redirect(307, "mpesa/request");
});

app.post("/mpesa/request", apiKeyMiddleware, async (req, res) => {
  const { amount, phone, orderId, customerId } = req.body;
  console.log(`LNMO request received for prder ${orderId}`);

  try {
    // Get access token
    const res1 = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            config.safaricomConsumerKey + ":" + config.safaricomConsumerSecret
          ).toString("base64")}`
        }
      }
    );
    console.log("Access token obtained");

    // Make stk push request
    const res2 = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      mpesaUtils.createStkBody(amount, phone, orderId),
      { headers: { Authorization: `Bearer ${res1.data.access_token}` } }
    );
    console.log(
      `STK push sent. Checkout request ID: ${res2.data.CheckoutRequestID}`
    );

    // Save request details
    await dbUtils.savePaymentRequest(
      res2.data.CheckoutRequestID,
      res2.data.MerchantRequestID,
      orderId,
      customerId
    );
    console.log("Saved payment request details");

    // Finish
    res.send({ message: "Success!" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Failed!" });
  }
});

app.post("/mpesa/callback", async (req, res) => {
  const callbackData = req.body.Body.stkCallback;
  console.log(`STK callback received: ${JSON.stringify(callbackData)}`);

  const parsedData = mpesaUtils.parseCallbackData(callbackData);
  console.log(
    `Callback checkout request id: ${JSON.stringify(
      parsedData.checkoutRequestID
    )}`
  );

  if (parsedData.resultCode == 0) {
    console.log("Transaction was successfull");
    const docId = await dbUtils.getDocumentId(parsedData.checkoutRequestID);
    console.log(`Document ID: ${docId}`);

    const orderId = await dbUtils.saveCompletedPayment(docId, parsedData);
    console.log(`Order ID: ${orderId}`);

    await dbUtils.setOrderToPaid(orderId);
    console.log("Order status updated");

    const order = await dbUtils.getOrder(orderId);
    const user = await dbUtils.getUser(order.customerId);

    notificationUtils.sendMpesaNotification(
      "Your payment was successful.",
      user.fcmToken,
      orderId,
      "completed"
    );
  } else {
    console.log(
      `Transaction failed for request ${parsedData.checkoutRequestID}`
    );
    const docId = await dbUtils.getDocumentId(parsedData.checkoutRequestID);
    console.log(`Document ID: ${docId}`);

    const orderId = await dbUtils.saveFailedPayment(docId, parsedData);
    console.log("Order status updated");

    const order = await dbUtils.getOrder(orderId);
    const user = await dbUtils.getUser(order.customerId);

    notificationUtils.sendMpesaNotification(
      "Your transaction was not successful.",
      user.fcmToken,
      orderId,
      "failed"
    );
  }

  res.send("OK");
});

module.exports = app;
