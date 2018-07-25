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

function sendMpesaNotification(body, token) {
  const payload = {
    data: { reason: "mpesa", body }
  };
  return admin.messaging().sendToDevice(token, payload);
}

module.exports = {
  sendNotification,
  sendOrderNotification,
  sendMpesaNotification
};
