# Authentication

Authentication provides an easy to install, easy to use authentication micro-service. While still being in development, it allows to sign up, sign in, and log in and out user right now. Of course more features are planned and on the roadmap.

This project is born on an idea and major participations of [arthurescriou](https://github.com/arthurescriou). This project would not live without him. Take a look at what he’s doing. I mainly mirrored his code.

## Roadmap

- [x] Reset Password
- [ ] Delete user account
- [ ] OAuth2
- [ ] Back Office built-in

## How it works?

It automatically connects to your [Bakery](https://github.com/FrenchPastries/Bakery) in order to provide its service and communicate with the outside world.

## Getting Started

```bash
yarn add @ghivert/authentication
```

To get it running, you need some parameters in your environment. You can use a `.env` at your root launch, the Authentication will automatically read it.

In the environment you need many variables.

- `RSA_PRIVATE_KEY` An RSA private key.
- `RSA_PUBLIC_KEY` The corresponding RSA public key.
- `PORT` The port on which the server is running.
- `HOSTNAME` The hostname on which the Authentication is running.
- `REGISTRY_HOST` The host on which the Bakery is running.
- `REGISTRY_PORT` The port on which the Bakery is running.
- `DATABASE_URL` The PostgreSQL database URI.
- `ORIGIN` The address from where you’re communicating.
- `AES_KEY` The AES key for crypting.
- `AES_IV` The AES param.
- `SENDGRID_API_KEY` Your sendgrid API key.

Then you can install the Authentication:

```bash
yarn add @frenchpastries/authentication
```

And start it right away!

```javascript
const Authentication = require('@frenchpastries/authentication')

Authentication.start()
```

To call it from your application:

### Sign In

```javascript
const mySignInHandler = request => {
  const { username, password } = request.body
  const response = await request.services.authentication.signIn().post({
    body: JSON.stringify({
      username,
      password,
    }),
  })
  const token = await response.text()
  // Here is the resulting token.
}
```

### Sign Up

```javascript
const mySignUpHandler = request => {
  const { username, password } = request.body
  const response = await request.services.authentication.signUp().post({
    body: JSON.stringify({
      username,
      password,
    }),
  })
  const token = await response.text()
  // Here is the resulting token.
}
```

### Check token

```javascript
const myCheckTokenHandler = request => {
  const { token } = request.headers.Authorize
  const response = await request.services.authentication
    .checkToken()
    .post({ body: JSON.stringify({ token }) })
  const userId = await response.text()
  // Here is the resulting user UUID.
}
```

### Delete session

```javascript
const mySignOutHandler = request => {
  const { token } = request.headers.Authorize
  const response = await request.services.authentication
    .signOut()
    .delete({ body: JSON.stringify({ token }) })
  const ok = await response.text()
  // assert(ok === 'OK')
}
```

### Reset password link

```javascript
const myResetPasswordHandler = ({ body }) => {
  const response = await request.services.authentication
    .sendMailReset()
    .post({ body })
  const ok = await response.text()
  // assert(ok === 'OK')
}
```

### Change password

```javascript
const myChangePasswordHandler = ({ body }) => {
  const response = await request.services.authentication
    .resetPassword()
    .post({ body })
  const ok = await response.text()
  // assert(ok === 'OK')
}
```

## Full API

The API is RESTful. All requests should contain a JSON body.

### User creation.

Creates a user and a session. Returns the JWT of the session.

`POST` `/sign-up`

```json
{
  "username": "rick.sanchez@miniverse.com",
  "password": "73|2|2Ys[_]|<S!"
}
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Creates a user and a session. Returns the JWT of the session.

### Authentication.

Creates a session for a registered user. Returns the JWT of the session.

`POST` `/sign-in`

```json
{
  "username": "rick.sanchez@miniverse.com",
  "password": "73|2|2Ys[_]|<S!"
}
```

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token checking

Check if a session is still active and if the token is valid. Returns user UUID if everything is correct.

`POST` `/check-token`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

```
c751dcf0-4efe-43e9-99c4-acdb8b995d04
```

### Log out

Set the session as invalid. Returns `OK`.

`DELETE` `/sign-out`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

```
OK
```

### Reset password link

Send an email for reseting password. Returns `OK`.

`POST` `/reset-password`

```json
{ "username": "rick.sanchez@miniverse.com" }
```

```
OK
```

### Change password

Reset the password. Returns `OK`.

`POST` `/reset-password`

```json
{ "password": "New-password", "resetId": "XXXXXXXXXXXXXX" }
```

```
OK
```
