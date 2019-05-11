# JustJava-CloudFunctions

Firebase cloud functions for [JustJava](https://github.com/MarkNjunge/JustJava-Android).

## Installation

```bash
$ git clone https://github.com/MarkNjunge/JustJava-CloudFunctions

$ cd JustJava-CloudFunctions/functions

$ yarn install
```

Link to a Firebase project by running

```bash
firebase init functions
```

choosing not to overwrite existing files.

Create a config file `/functions/src/config.js`

```Javascript
module.exports = {
  apiKey: "api_key",
  safaricomConsumerKey: "safaricom_consumer_key",
  safaricomConsumerSecret: "safaricom_consumer_secret",
  basefunctionsUrl: "https://deploy-location-project-name.cloudfunctions.net/mpesa/"
};
```

`apiKey`: A key used for LNMO request.
`safaricomConsumerKey`, `safaricomConsumerSecret`: Get from [Safaricom developer portal](https://developer.safaricom.co.ke/)
`basefunctionsUrl`: The only accurate way to determine this is to first deploy. **MUST** end with `mpesa/`.

## Testing locally

To test Messaging locally, you will need to [set up admin credentials](https://firebase.google.com/docs/functions/local-emulator?authuser=0#set_up_admin_credentials_optional).

### Testing HTTP endpoints

```bash
$ cd functions & yarn serve
```

Firebase will give you an address for the endpoints. For example, `http://localhost:5000/justjava-android/us-central1/mpesa`

To make the endpoints reachable outside your network, you wil need to use a http tunneling client such as [Ngrok](https://ngrok.com/).

Using Ngrok
Expose port 5000 (Firebase's default port) using

```bash
$ ngrok http 5000
```

Ngrok will give you an address such as `http://f2ca75f0.ngrok.io`

The resulting url for the endpoint will therefore be `http://f2ca75f0.ngrok.io/justjava-android/us-central1/mpesa`

### Testing firestore triggers

```bash
$ cd functions & yarn shell
```

Sample command for a completed order

```
notifyOnCompletedOrder({ after: { status: "COMPLETED", fcmToken:"get_a_valid_token", date: "May 15, 2018 at 9:30:45 PM UTC+3", customerId: "customer_id"}}, { params: { orderId: "order_id" } })
```

## Deploy

```
firebase deploy --only functions
```
