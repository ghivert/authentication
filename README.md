# Authentication

### createUser
```json
{"userName": "userName", "password": "password"}
```
create user

create a session

return jwt of session

### auth
```json
{"userName": "userName", "password": "password"}
```
create a session

return jwt of session

### checkToken

```json
{"token": "token"}
```
check if session still active
and if token is valid

return user uuid if all is valid

### logout

```json
{"token": "token"}
```

set session invalid
return "ok"
