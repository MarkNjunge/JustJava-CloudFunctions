//@ts-check
const functions = require("firebase-functions");

const callbackHandler = require("./mpesa/callbackUrl");
const notificationHelper = require("./utils/notificationHelper");
const dbHelper = require("./utils/dbHelper");

module.exports.notifyOnCompletedOrder = functions.firestore
  .document("/orders/{orderId}")
  .onUpdate((change, context) => {
    return new Promise((resolve, reject) => {
      const orderId = context.params.orderId;
      const status = change.after.data().status;
      const orderToken = change.after.data().fcmToken;
      const customerId = change.after.data().customerId;

      console.log(`Update to order ${orderId}, Status: ${status}`);

      if (status != "COMPLETED") {
        console.log("Nothing to send to user.");
        resolve("Nothing to send to user.");
        return;
      }

      // If there is a fcm token in the user's details, use it, otherwise, use token in order.
      dbHelper
        .getUser(customerId)
        .then(user => {
          var token = "";
          if (user.fcmToken) {
            token = user.fcmToken;
            console.log("User has token!");
          } else {
            console.log("User does not have a token");
            token = orderToken;
          }
          return token;
        })
        .then(token => notificationHelper.sendOrderNotification(orderId, token))
        .then(() => {
          console.log("Notification sent to user.");
          resolve("Notification sent to user.");
        })
        .catch(reason => {
          console.log(reason);
          reject(reason);
        });
    });
  });

module.exports.callbackHandler = callbackHandler;
