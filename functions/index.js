//@ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { mpesaHandler, notifyOnCompletedOrder } = require("./src");

exports.notifyOnCompletedOrder = notifyOnCompletedOrder;

exports.callback_url = functions.https.onRequest(mpesaHandler); // Kept for legacy

exports.mpesa = functions.https.onRequest(mpesaHandler);
