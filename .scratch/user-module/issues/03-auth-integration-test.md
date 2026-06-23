# Issue 03 — Auth integration test

Status: closed

## Goal

Verify the complete registration → login → logout flow works end-to-end.

## Acceptance criteria

- [ ] Run backend Flask server
- [ ] Open `frontend/register.html` in browser and create a user
- [ ] Login with the new user
- [ ] Arrive at `dashboard.html` and see current username
- [ ] Click logout and return to login page
- [ ] Try accessing `dashboard.html` without login → redirected to login

## Test notes

Use Flask `test_client` for backend API tests where possible. Manual browser test for full flow.

## Dependencies

- Issue 01 backend auth API
- Issue 02 frontend auth pages

## Out of scope

- Automated E2E test framework (Playwright/Selenium)
