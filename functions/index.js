//@ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const callbackHandler = require("./callbackUrl");
const notificationHelper = require("./notificationHelper");

exports.notifyOnCompletedOrder = functions.firestore
  .document("orders/{orderId}")
  .onUpdate((change, context) => {
    return new Promise((resolve, reject) => {
      const orderId = context.params.orderId;
      const status = change.after.data().status;
      const token = change.after.data().fcmToken;
      const date = change.after.data().date;

      console.log(`Update to order ${orderId}, Status: ${status}`);

      if (status != "COMPLETED") {
        console.log("Nothing to send to user.");
        resolve("Nothing to send to user.");
        return;
      }

      if (token) {
        notificationHelper
          .sendOrderNotification(orderId, token)
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
