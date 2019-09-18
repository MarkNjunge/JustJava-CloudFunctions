# JustJava-CloudFunctions

Firebase cloud functions for [JustJava](https://github.com/MarkNjunge/JustJava-Android).

## Installation

- Clone the repository

```bash
$ git clone https://github.com/MarkNjunge/JustJava-CloudFunctions just-java-cloud-functions
```

- Install dependencies

```bash
$ cd just-java-cloud-functions/functions

$ yarn install
```

- Link to a Firebase project, choosing **not** to overwrite existing files.

```bash
$ firebase init functions
```

- Create a config.json file `/functions/config.json`. See [config.sample.json](./functions/config.sample.json)

```Javascript
module.exports = {
  apiKey: "api_key",
  safaricomConsumerKey: "safaricom_consumer_key",
  safaricomConsumerSecret: "safaricom_consumer_secret",
  basefunctionsUrl: "https://[region]-[project-name].cloudfunctions.net/payments/"
};
```

`apiKey`: A key of your chosing. It is used to verify requests.  
`safaricomConsumerKey`, `safaricomConsumerSecret`: Get from [Safaricom developer portal](https://developer.safaricom.co.ke/)  
`basefunctionsUrl`: The only accurate way to determine this is to first deploy, then check the url. **MUST** end with `payments/`.

## Functions

### [Firestore Trigger] notifyOnCompletedOrder

Notifies a user when their order is marked as completed.

### [HTTP Trigger] /payments/mpesa/request

Makes an STK push request to M-Pesa's API.

```JSON
{
  "amount": "1",
  "phone": "2547xxxxxxxx",
  "customerId": "customer_id",
  "orderId": "order_id",
}
```

### [HTTP Trigger] /payments/mpesa/callback

Route for LNMO callback requests

## Testing locally

To test **messaging** locally, you will need to [set up admin credentials](https://firebase.google.com/docs/functions/local-emulator?authuser=0#set_up_admin_credentials_optional).

### Testing HTTP endpoints

```bash
$ cd functions & yarn serve
```

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
