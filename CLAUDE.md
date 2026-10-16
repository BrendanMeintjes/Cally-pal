# Cally-pal — Claude Context

## What this is
A calendar app where two users can find mutual free time slots. An AI agent (via MCP) can be asked things like "schedule us for 2 hours at my next available spot" and it finds a window that works on both calendars without clashing.

## Build philosophy
- **Methodical, phased** — one phase at a time, stop and let the user test before moving on
- **User is learning** — explain decisions, don't just write code. When something is non-obvious, say why
- **Reference spec.md** — check off items as they're completed, keep it up to date
- **It's ok to refactor** — we accepted that early phases use mocks/stubs that get replaced later
- **No 1-shotting** — do not scaffold the entire app at once. Work through spec.md phases in order

## Stack decisions (already agreed)
| Layer | Choice | Why |
|---|---|---|
| Backend | Go | Sticker Mule stack |
| GraphQL server | gqlgen | Schema-first, type-safe, Sticker Mule stack |
| DB driver | pgx (raw SQL, no ORM) | Simple, explicit |
| Database | Supabase (Postgres) | Managed, free tier, includes Auth |
| Auth | Supabase Auth + JWT middleware | Zero config, JWT verified in Go |
| Frontend | Vite + React + TypeScript | Lightweight, no Next.js overhead for a demo |
| GraphQL client | urql | Simpler than Apollo |
| MCP server | mcp-go (mark3labs) | Most mature Go MCP lib |
| Hosting | Vercel (frontend) + Railway (backend) + Supabase (DB) | Free/cheap, shareable link |

## Project structure (target)
```
/
├── cmd/
│   ├── api/        # Go GraphQL server
│   └── mcp/        # Go MCP server
├── internal/
│   ├── auth/       # JWT middleware
│   ├── db/         # pgx queries (plain functions)
│   └── services/   # business logic (slot algorithm lives here)
├── graph/
│   ├── schema.graphql
│   ├── resolver.go
│   └── schema.resolvers.go
├── migrations/     # SQL run via Supabase
├── web/            # Vite + React + TypeScript
└── spec.md
```

## Core data model
```
users        — managed by Supabase Auth
calendars    — id, user_id, name, timezone, share_id
events       — id, calendar_id, title, start_at, end_at
```

## Key feature: slot finding algorithm
- Fetch events from all provided calendar IDs
- Merge + sort by start time
- Walk the gaps, find windows ≥ requested duration
- Respect optional rangeStart/rangeEnd constraints
- Lives in `internal/services/slots.go`, shared by GraphQL resolvers AND MCP tools

## Current phase
See spec.md — always check which phase is active before writing any code.

## Stop points
After completing each phase, stop and tell the user:
- What was built
- How to test it
- What comes next
Do not proceed to the next phase until the user confirms it's working.
