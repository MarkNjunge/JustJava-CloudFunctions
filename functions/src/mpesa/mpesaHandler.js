//@ts-check
const app = require("express")();
const cors = require("cors");
const axios = require("axios").default;
const moment = require("moment");

const notificationHelper = require("../utils/notificationHelper");
const {
  getDocumentId,
  savePaymentRequest,
  saveCompletedPayment,
  saveFailedPayment,
  setOrderToPaid
} = require("../utils/dbHelper");
const {
  apiKey,
  safaricomConsumerKey,
  safaricomConsumerSecret,
  baseCallbackUrl
} = require("../config");

app.use(cors({ origin: true }));

const parse = require("./parse");

const apiKeyMiddleware = (req, res, next) => {
  const reqApiKey = req.header("ApiKey");
  if (!reqApiKey || reqApiKey != apiKey) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  next();
};

app.post("/request", apiKeyMiddleware, async (req, res) => {
  const { amount, phone, orderId, customerId, fcmToken } = req.body;

  try {
    // Get access token
    const res1 = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            safaricomConsumerKey + ":" + safaricomConsumerSecret
          ).toString("base64")}`
        }
      }
    );

    // Make stk push request
    const res2 = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      createStkBody(amount, phone, orderId, fcmToken),
      { headers: { Authorization: `Bearer ${res1.data.access_token}` } }
    );

    // Finish
    res.send({ message: "Success!" });

    // Save request details
    await savePaymentRequest(
      res2.data.CheckoutRequestID,
      res2.data.MerchantRequestID,
      orderId,
      customerId
    );
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Failed!" });
  }
});

app.post("/:token", async (req, res) => {
  console.log("Callback received.");
  res.send("OK");

  const callbackData = req.body.Body.stkCallback;
  console.log(JSON.stringify(callbackData));

  const parsedData = parse(callbackData);
  console.log(JSON.stringify(parsedData));

  if (parsedData.resultCode == 0) {
    const docId = await getDocumentId(parsedData.checkoutRequestID);
    console.log(docId);

    const orderId = await saveCompletedPayment(docId, parsedData);
    console.log(orderId);

    await setOrderToPaid(orderId);

    notificationHelper.sendMpesaNotification(
      "Your payment was successful.",
      req.params.token,
      orderId,
      "completed"
    );
  } else {
    const docId = await getDocumentId(parsedData.checkoutRequestID);
    console.log(docId);

    const orderId = await saveFailedPayment(docId, parsedData);
    notificationHelper.sendMpesaNotification(
      "Your transaction was not successful.",
      req.params.token,
      orderId,
      "failed"
    );
  }
});

function createStkBody(amount, phone, orderId, fcmToken) {
  const businessShortCode = 174379;
  const passKey =
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
  var now = moment();
  const timestamp = now.format("YYYYMMDDHHmmss");

  const password = Buffer.from(
    `${businessShortCode}${passKey}${timestamp}`
  ).toString("base64");

  return {
    AccountReference: orderId,
    Amount: amount,
    BusinessShortCode: businessShortCode,
    CallBackURL: `${baseCallbackUrl}${fcmToken}`,
    PartyA: phone,
    PartyB: businessShortCode,
    Password: password,
    PhoneNumber: phone,
    Timestamp: timestamp,
    TransactionDesc: `Payment for ${orderId}`,
    TransactionType: "CustomerPayBillOnline"
  };
}

module.exports = app;
