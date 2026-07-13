# Archive

When and where to retire documents that are no longer current but worth keeping.

## Two different things named "archive"

| Path | What it is |
|------|------------|
| `docs/archive/` | **Content** — retired process docs, old reviews, superseded plans |
| `docs/agents/archive.md` | **Protocol** — this file: the rules for archiving |

Do not confuse them. This file is the protocol; that directory holds the retired material.

## When to archive (not delete)

- A review or process doc superseded by a newer one
- A design exploration that informed a decision (keep for context, link the ADR)
- Phase / weekly summaries whose facts now live elsewhere but whose history matters

## When to delete instead

- Pure duplication (the same content lives elsewhere, verbatim)
- Dead references with no historical value
- Auto-generated artifacts that can be regenerated

## How to archive

1. Move the file into `docs/archive/` (keep filename; prefix with a date if it collides).
2. Add a one-line header: `> Archived YYYY-MM-DD — superseded by <where the truth now lives>.`
3. Remove it from any "current" navigation or index.

Archived files are read-only context, not active instructions. Do not update them to reflect new reality — that is what the current doc is for.
