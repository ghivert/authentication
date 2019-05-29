# Authentication

### Create User, path: `/createUser`

```json
{
  "userName": "userName",
  "password": "password"
}
```

Creates a user and a session. Returns the JWT of the session.

### Authenticate, path: `/auth`

```json
{
  "userName": "userName",
  "password": "password"
}
```

Creates only a session for a registered user. Returns the JWT of the session.

### Check an existing token, path: `/checkToken`

```json
{
  "token": "token"
}
```

Check if a session is still active and if the token is valid. Returns user UUID if everything is correct.

### Log out the user, path: `/logout`

```json
{
  "token": "token"
}
```

Set the session as invalid. Returns `ok`.
