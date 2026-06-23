# Issue 02 — Frontend auth pages

Status: closed

## Goal

Wire up the existing login and register pages to the backend API.

## Acceptance criteria

- [ ] `login.html` calls `POST /api/auth/login` and redirects to `dashboard.html` on success
- [ ] `register.html` calls `POST /api/auth/register` and redirects to `login.html` on success
- [ ] `dashboard.html` calls `GET /api/auth/me` on load; redirects to `login.html` if not authenticated
- [ ] Logout button clears session/local state and redirects to `login.html`
- [ ] Form errors show clear messages
- [ ] CORS is configured so frontend can call backend from `file://` or local server

## Dependencies

- Issue 01 backend auth API

## Out of scope

- Password strength indicator
- Remember me
- Fancy animations
