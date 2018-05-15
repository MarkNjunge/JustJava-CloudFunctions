const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const callbackHandler = require("./callbackUrl");

exports.notifyOnCompletedOrder = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(event => {
    return new Promise((resolve, reject) => {
      const orderId = event.params.orderId;
      const status = event.data.data().status;
      const token = event.data.data().fcmToken;
      const timestanp = event.data.data().timestanp;

      console.log(`Update to order ${orderId}, Status: ${status}`);

      if (status != "COMPLETED") {
        resolve("Nothing to send to user.");
        return;
      }

      if (token) {
        sendNotification(orderId, timestanp, token)
          .then(response => {
            console.log("Notification sent to user.");
            resolve("Notification sent to user.");
          })
          .catch(reason => {
            console.log(reason);
            reject(reason);
          });
      } else {
        console.log("No token available.");
        resolve("No token available.");
      }
    });
  });

exports.callback_url = functions.https.onRequest(callbackHandler);

function sendNotification(orderId, timestamp, token) {
  const payload = {
    data: { orderId, timestamp, reason: "completed-order" }
  };
  return admin.messaging().sendToDevice(token, payload);
}
