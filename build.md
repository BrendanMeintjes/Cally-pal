# Cally-pal — Build Notes

Running log of technical decisions, gotchas, and explanations as we build.
Add to this as each phase surfaces something worth remembering.

---

## Phase 1 — DB Schema

### RLS (Row Level Security)
- The Go backend uses a **service role key** — it bypasses RLS entirely and can read/write anything in the DB
- RLS only kicks in if someone hits Supabase directly (e.g. via Supabase JS in the browser or a raw API call)
- **"Any authenticated user can read any calendar/event" is intentional** — required for cross-user slot finding. Without this, User B's agent call couldn't read User A's events to check for conflicts
- RLS is a safety net, not the primary auth layer — the Go middleware handles that

### Why `share_id` is separate from `id`
- `id` is the internal primary key — never exposed outside the backend
- `share_id` is a stable public UUID — safe to hand to an AI agent or another user
- This way we can rotate or revoke sharing without touching the primary key or breaking relations

### Why times are stored in UTC
- Storing in UTC means no ambiguity — no daylight saving edge cases in the DB
- `timezone` on the calendar is purely for display: the frontend reads it and converts UTC → local time when rendering
- All comparisons in the slot-finding algorithm run in UTC, which keeps the math simple

### Why the index on `events (calendar_id, start_at, end_at)`
- The slot-finding algorithm does range scans: "give me all events for these calendars between time A and time B"
- Without the index, Postgres scans every row in the events table on every query
- With the index, it jumps straight to the relevant calendar and time range — stays fast even with lots of events

---

## Phase 2 — UI (mocked data)
_Notes will be added here during Phase 2_

---

## Phase 3 — GraphQL API + DB
_Notes will be added here during Phase 3_

---

## Phase 4 — Wire UI to API
_Notes will be added here during Phase 4_

---

## Phase 5 — Auth
_Notes will be added here during Phase 5_

---

## Phase 6 — MCP Layer
_Notes will be added here during Phase 6_
