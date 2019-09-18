//@ts-check
const admin = require("firebase-admin");
const firestore = admin.firestore();
const moment = require("moment");

/**
 * Get a document id for payment
 *
 * @param {String} checkoutRequestID CheckoutRequestID from Safaricom
 */
function getDocumentIdForPayment(checkoutRequestID) {
  return firestore
    .collection("payments")
    .where("checkoutRequestId", "==", checkoutRequestID)
    .limit(1)
    .get()
    .then(snapshot => snapshot.docs[0].id);
}

/**
 * Save a pending payment
 * @param {string} checkoutRequestId
 * @param {string} merchantRequestId
 * @param {string} orderId
 * @param {string} customerId
 */
function savePaymentRequest(
  checkoutRequestId,
  merchantRequestId,
  orderId,
  customerId
) {
  return firestore
    .collection("payments")
    .doc(checkoutRequestId)
    .set({
      checkoutRequestId,
      merchantRequestId,
      orderId,
      customerId,
      status: "pending"
    });
}

/**
 * @param {String} id Document id for the payment
 * @param {Object} parsedData Parsed callback data
 */
function saveCompletedPayment(id, parsedData) {
  return firestore
    .collection("payments")
    .doc(id)
    .get()
    .then(snapshot => {
      return firestore
        .collection("payments")
        .doc(id)
        .update({
          amount: parsedData.amount,
          mpesaReceiptNumber: parsedData.mpesaReceiptNumber,
          date: moment().unix(),
          dateSaf: parsedData.transtactionDate,
          phoneNumber: parsedData.phoneNumber,
          status: "completed",
          resultDesc: parsedData.resultDesc,
          resultCode: parsedData.resultCode
        })
        .then(() => snapshot.data().orderId);
    });
}

/**
 * @param {String} id Document id for the payment
 * @param {Object} parsedData Parsed callback data
 */
function saveFailedPayment(id, parsedData) {
  return firestore
    .collection("payments")
    .doc(id)
    .get()
    .then(snapshot => {
      return firestore
        .collection("payments")
        .doc(id)
        .update({
          resultDesc: parsedData.resultDesc,
          resultCode: parsedData.resultCode,
          date: moment().unix(),
          status: "failed"
        })
        .then(() => snapshot.data().orderId);
    });
}

/**
 * @param {String} orderId Order id
 */
function setOrderToPaid(orderId) {
  return firestore
    .collection("orders")
    .doc(orderId)
    .update({
      paymentStatus: "paid"
    })
    .then(() => orderId);
}

/**
 * Get a user's details
 * @param {String} userId The user's id
 */
function getUser(userId) {
  return firestore
    .collection("users")
    .doc(userId)
    .get()
    .then(doc => doc.data());
}

/**
 * Get an order by its id
 * @param {String} orderId Order ID
 */
function getOrder(orderId) {
  return firestore
    .collection("orders")
    .doc(orderId)
    .get()
    .then(doc => doc.data());
}

module.exports = {
  getDocumentId: getDocumentIdForPayment,
  savePaymentRequest,
  saveCompletedPayment,
  saveFailedPayment,
  setOrderToPaid,
  getUser,
  getOrder
};
