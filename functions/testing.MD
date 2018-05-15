# Functions

## notifyOnCompletedOrder()

To test FCM admin credentials need to be set up. See [Set up admin credentials](https://firebase.google.com/docs/functions/local-emulator?authuser=0#set_up_admin_credentials_optional).

Set and environment variable using

```
set GOOGLE_APPLICATION_CREDENTIALS=key.json
```

Run the emulator using

```
firebase functions:shell
```

Sample command for a completed order

```
notifyOnCompletedOrder({ after: { status: "COMPLETED", fcmToken:"get_an_validtoken", date: "May 15, 2018 at 9:30:45 PM UTC+3" }}, { params: { orderId: "d5d64e9fb0" } })
```
