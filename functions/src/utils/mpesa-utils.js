const moment = require("moment");
const config = require("./../config");

function parseCallbackData(responseData) {
  const parsedData = {};
  parsedData.merchantRequestID = responseData.MerchantRequestID;
  parsedData.checkoutRequestID = responseData.CheckoutRequestID;
  parsedData.resultDesc = responseData.ResultDesc;
  parsedData.resultCode = responseData.ResultCode;

  if (parsedData.resultCode == 0) {
    responseData.CallbackMetadata.Item.forEach(element => {
      /* eslint-disable indent */
      switch (element.Name) {
        case "Amount":
          parsedData.amount = element.Value;
          break;
        case "MpesaReceiptNumber":
          parsedData.mpesaReceiptNumber = element.Value;
          break;
        case "TransactionDate":
          parsedData.transtactionDate = element.Value;
          break;
        case "PhoneNumber":
          parsedData.phoneNumber = element.Value;
          break;
      }
      /* eslint-enable indent */
    });
  }

  return parsedData;
}

function createStkBody(amount, phone, orderId) {
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
    CallBackURL: `${config.baseCallbackUrl}mpesa/callback`,
    PartyA: phone,
    PartyB: businessShortCode,
    Password: password,
    PhoneNumber: phone,
    Timestamp: timestamp,
    TransactionDesc: `Payment for ${orderId}`,
    TransactionType: "CustomerPayBillOnline"
  };
}

module.exports = {
  createStkBody,
  parseCallbackData
};
