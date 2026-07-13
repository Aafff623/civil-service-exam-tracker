# Deliver

What "done" means. For step-by-step ship actions, see `module-development-workflow.md` § After finishing.

## Definition of done

A module is NOT done until ALL hold:

- [ ] Every acceptance criterion in `.scratch/<module>/issues/*.md` verified, one by one
- [ ] Happy path + boundary + error path tested
- [ ] Database changes reflected in the seed SQL (`db/seed/`) and re-imported via `init_db.py`
- [ ] Project-level status & handoff docs updated to current truth
- [ ] ADR written if a non-trivial decision was made (`docs/adr/000N-*.md`)
- [ ] One atomic commit; imperative subject; body explains what + why
- [ ] Superseded process docs archived, not left dangling (see `archive.md`)

## Anti-patterns

- Declaring done with failing tests or unverified boundary cases
- Updating code but not the seed SQL — breaks machine-swap reproducibility
- Bunching several modules into one commit
- Deleting a doc that is still referenced instead of archiving it
- Updating docs to aspirational state instead of observed state
