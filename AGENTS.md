# AGENTS.md

## Project purpose

This project is a Vercel / Next.js tool for monthly client meeting agenda management.

The source of truth is Supabase Postgres, not Stock, localStorage, JSON files, or the GitHub repository.

## Must support

- staff login with Supabase Auth
- client registration and selection
- monthly meeting creation by client and target month
- automatic carry-forward from the previous month in Supabase
- agenda organization by:
  - past topics
  - current topics
  - future topics
- item status management
- next-month carry-forward control
- client-facing output
- internal memo output
- Stock paste-ready summary output
- post-meeting checklist

## Non-goals

Do not implement:

- TKC replacement features
- director instruction PDF display
- CSV anomaly detection
- tax judgment automation
- Stock API integration
- Stock login automation
- Stock screen scraping
- automatic Stock task creation

## Data handling

Treat all client names, meeting notes, carry-forward items, and agenda data as confidential.

Rules:

- Do not include real client names in samples, tests, seed data, or documentation screenshots.
- Do not include internal documents.
- Do not store real client data in the GitHub repository.
- Do not put Supabase service role keys in browser code.
- Do not commit `.env.local`.
- Use Supabase RLS for all exposed tables.
- localStorage must not be used as authoritative storage.

## Supabase source-of-truth rules

- Supabase Postgres stores clients, meetings, agenda items, internal notes, and checklist state.
- JSON export is a backup/export convenience, not the source of truth.
- Stock paste-ready summary is an output, not the source of truth.
- Stock can be used as a human-readable communication record, but the app must not depend on Stock attachments.

## Carry-forward rules

Carry forward only items where:

- `carry_forward` is true
- `status` is not `done`
- `status` is not `withdrawn`

`open`, `in_progress`, and `on_hold` are carry-forward eligible.

## Visibility rules

- `visibility=client` may appear in client-facing output.
- `visibility=internal` must never appear in client-facing output.
- Internal output may include both client and internal items.
- `internal_notes` must not appear in client-facing output.

## Review priorities

Prioritize serious issues:

- confidential data leakage
- service role key exposure
- broken RLS assumptions
- internal notes appearing in client-facing output
- incorrect carry-forward behavior
- fragile month/date logic
- confusing Stock with the source of truth
- confusing TKC with this tool

Use sub-agents when they are helpful for focused review or verification.
