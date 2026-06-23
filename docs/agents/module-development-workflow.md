# Module Development Workflow

This document defines the standard workflow for implementing a single feature module in this repo. All engineering skills (`/tdd`, `/diagnose`, `/review`, etc.) should follow it.

## Before starting

### 1. Break down the work

Create a directory under `.scratch/` for the module:

```
.scratch/<module-slug>/
├── PRD.md              # Optional: module-level PRD if the main PRD is not detailed enough
└── issues/
    ├── 01-api-endpoints.md
    ├── 02-frontend-page.md
    └── 03-integration-tests.md
```

Each issue file must include:
- **Goal**: one sentence
- **Acceptance criteria**: at least 3 verifiable items
- **Dependencies**: what must be done first
- **Scope notes**: what is explicitly out of scope

### 2. Define interface contracts

Before writing code, write down:

- **Backend**: API path, HTTP method, request body, response shape
- **Frontend**: page URL, user flow, APIs called
- **Database**: new tables, columns, indexes, migrations if needed

Use the standard API response format everywhere:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### 3. Write a test plan

Every module needs tests for:
- **Happy path**: normal usage works
- **Boundary cases**: empty input, duplicates, invalid IDs
- **Error path**: 401 unauthorized, 404 not found, 500 server error

For this course project, tests can be simple: use Flask `test_client` for backend API tests, and manual browser checks for frontend pages.

## During implementation

### 1. Use TDD red-green-refactor

1. **Red**: write a failing test
2. **Green**: write the minimum code to pass
3. **Refactor**: clean up while keeping tests green

If a module is too small for full TDD, still write at least one test or verification step before declaring it done.

### 2. Code quality rules

- One function does one thing.
- Use domain terms from `CONTEXT.md` for variable and table names.
- No speculative abstractions. Don't write code for features not requested.
- Don't refactor unrelated code. Surgical changes only.
- Remove unused imports, variables, and functions created by your changes.

### 3. Security and robustness

- Validate all inputs on the backend.
- Hash passwords with `werkzeug.security` (or better).
- Never return password hashes in API responses.
- Use parameterized SQL queries to prevent injection.
- Return clear error messages to the frontend.

### 4. Continuous verification

- After each API route: test it with `test_client` or `curl`.
- After each frontend page: open it in the browser and click through.

## After finishing

### 1. Self-test

Run the complete user flow for the module end-to-end:
- Open the page
- Submit the form / click the button
- Check the database changed correctly
- Check the response shape matches the contract

### 2. Review against acceptance criteria

Go through the issue file's acceptance criteria one by one. If anything is missing, fix it before moving on.

### 3. Update documentation

Update these files:

- `docs/PROJECT_STATUS.md`: mark the module as completed
- `docs/HANDOFF.md`: record what was done and the next step
- `.scratch/<module-slug>/issues/*.md`: update status to `closed`
- `docs/adr/`: create an ADR if the module involved a non-trivial architectural decision

### 4. Commit

One module = one atomic commit.

Commit message format:

```
feat(module): short description

- What changed
- Why it was needed

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```

Then push to GitHub.

### 5. Handoff

Ensure `docs/HANDOFF.md` answers:
- What was completed in this module?
- Are there any known issues or shortcuts?
- What is the next module to work on?
- What should the next agent know before continuing?

## Module checklist

Use this checklist before declaring a module done:

- [ ] Issue file created under `.scratch/`
- [ ] Acceptance criteria defined
- [ ] Backend API implemented and tested
- [ ] Frontend page implemented and manually checked
- [ ] Database operations verified
- [ ] Error handling in place
- [ ] `docs/PROJECT_STATUS.md` updated
- [ ] `docs/HANDOFF.md` updated
- [ ] Commit pushed to GitHub
