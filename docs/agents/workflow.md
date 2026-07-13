# Workflow

How engineering work flows in this repo. For the full module-level checklist, see `module-development-workflow.md`. This file is the index.

## Rhythm: before / during / after

Every non-trivial change moves through three phases.

| Phase | Action | Skills |
|-------|--------|--------|
| **Before** | Align intent, break down work under `.scratch/<module>/`, define interface contracts, write a test plan | `/grill-me`, `/grill-with-docs`, `/to-issues` |
| **During** | TDD red-green-refactor, surgical changes, continuous verification | `/tdd`, `/diagnose` |
| **After** | Self-test, review against acceptance criteria, update status docs, commit, handoff | `/review`, `deliver.md` |

## Skill entry points

- Discovery / intent alignment: `/grill-with-docs`
- Issue breakdown: `/to-issues`
- Implementation: `/tdd`
- Debugging: `/diagnose`
- Review before commit: `/review`
- Commit message: `git-commit-helper`

## See also

- `module-development-workflow.md` — detailed before/during/after checklist (the authoritative flow)
- `issue-tracker.md` — where issues live
- `triage-labels.md` — label vocabulary
- `deliver.md` — definition of done
- `archive.md` — when to retire docs
- `domain.md` — how to consume domain docs
