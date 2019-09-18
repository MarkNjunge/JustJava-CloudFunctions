//@ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { router, notifyOnCompletedOrder } = require("./src/app");

exports.notifyOnCompletedOrder = notifyOnCompletedOrder;

exports.mpesa = functions.https.onRequest(router); // Kept for legacy

exports.payments = functions.https.onRequest(router);
