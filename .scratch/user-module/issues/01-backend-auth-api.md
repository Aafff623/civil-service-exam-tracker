# Issue 01 — Backend auth API

Status: closed

## Goal

Implement backend API endpoints for user registration, login, logout, and current user info.

## Acceptance criteria

- [ ] `POST /api/auth/register` creates a new user with hashed password
- [ ] `POST /api/auth/login` validates credentials and creates a session
- [ ] `POST /api/auth/logout` clears the session
- [ ] `GET /api/auth/me` returns current user info (no password hash)
- [ ] Duplicate username returns clear error
- [ ] Wrong password returns clear error
- [ ] All endpoints return `{success, data, message}` format

## Dependencies

- Database schema must exist (`backend/init_db.sql`)
- `users` table must be created

## API contracts

### POST /api/auth/register

Request:
```json
{
  "username": "test",
  "password": "123456"
}
```

Success 201:
```json
{
  "success": true,
  "data": { "id": 1, "username": "test" },
  "message": "User created"
}
```

Error 400 (duplicate):
```json
{
  "success": false,
  "data": null,
  "message": "Username already exists"
}
```

### POST /api/auth/login

Request:
```json
{
  "username": "test",
  "password": "123456"
}
```

Success 200:
```json
{
  "success": true,
  "data": { "id": 1, "username": "test" },
  "message": "Login successful"
}
```

### POST /api/auth/logout

Success 200:
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

### GET /api/auth/me

Success 200:
```json
{
  "success": true,
  "data": { "id": 1, "username": "test" },
  "message": ""
}
```

Error 401:
```json
{
  "success": false,
  "data": null,
  "message": "Not authenticated"
}
```

## Out of scope

- Password reset
- Email verification
- OAuth / third-party login
