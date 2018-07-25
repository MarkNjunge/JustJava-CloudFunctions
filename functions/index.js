//@ts-check
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const { callbackHandler, notifyOnCompletedOrder } = require("./src");

exports.notifyOnCompletedOrder = notifyOnCompletedOrder;

exports.callback_url = functions.https.onRequest(callbackHandler);
