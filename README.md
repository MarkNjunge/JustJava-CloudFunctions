# JustJava-CloudFunctions

Firebase cloud functions for [JustJava](https://github.com/MarkNjunge/JustJava-Android).

## Installation

- Clone the repository

```bash
$ git clone https://github.com/MarkNjunge/JustJava-CloudFunctions
```

- Install dependencies

```bash
$ cd JustJava-CloudFunctions/functions

$ yarn install
```

- Link to a Firebase project by running `...` choosing **not** to overwrite existing files.

```bash
$ firebase init functions
```

- Create a config file `/functions/src/config.js`

```Javascript
module.exports = {
  apiKey: "api_key",
  safaricomConsumerKey: "safaricom_consumer_key",
  safaricomConsumerSecret: "safaricom_consumer_secret",
  basefunctionsUrl: "https://deploy-location-project-name.cloudfunctions.net/mpesa/"
};
```

`apiKey`: A key of your chosing. It is used to verify requests.  
`safaricomConsumerKey`, `safaricomConsumerSecret`: Get from [Safaricom developer portal](https://developer.safaricom.co.ke/)  
`basefunctionsUrl`: The only accurate way to determine this is to first deploy, then check the url. **MUST** end with `mpesa/`.

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
