const admin = require("firebase-admin");

function sendNotification(title, body, token) {
  const payload = { notification: { title, body } };
  return admin.messaging().sendToDevice(token, payload);
}

function sendOrderNotification(orderId, token) {
  const payload = {
    data: { orderId, reason: "completed-order" }
  };
  return admin.messaging().sendToDevice(token, payload);
}

/**
 * @param {String} body Notification body
 * @param {String} token FCM token
 * @param {String} orderId orderId
 * @param {String} status completed or failed
 */
function sendMpesaNotification(body, token, orderId, status) {
  const payload = {
    data: { reason: "mpesa", body, orderId, status }
  };
  return admin.messaging().sendToDevice(token, payload);
}

module.exports = {
  sendNotification,
  sendOrderNotification,
  sendMpesaNotification
};
