function parse(responseData) {
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

module.exports = parse;
