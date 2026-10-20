# Cally-pal — Build Spec

## App summary
Two users, each with a calendar full of events. An AI agent can be asked to find a time that works for both — "schedule us for 2 hours at my next available spot" — and it finds or creates the meeting without clashing.

Two modes:
- **Sandbox mode** — no sign-in required, uses hardcoded mock data (Alice + Bob). Good for demos and testing
- **Real mode** — sign in with Google, pulls live Google Calendar data, books real events

---

## Phase 1 — DB Schema
**Status: COMPLETE ✓**

### Tables
- [x] `calendars` — id, user_id, name, timezone (default UTC), share_id
- [x] `events` — id, calendar_id, title, description, notes, start_at, end_at

### Confirmed decisions
- [x] Events have `description` (TEXT, nullable) and `notes` (TEXT, nullable)
- [x] Timezone stored on calendar, not on events. All times stored in UTC. Display timezone per-user later
- [x] Cross-user access via `share_id` — agent is given both calendar share_ids to find and book mutual slots
- [x] Agent books directly on both calendars via `scheduleMeeting`. Email invite is future work
- [x] RLS policies written and verified against current Supabase docs
- [x] Migration run in Supabase dashboard
- [x] .env filled in with all keys

---

## Phase 2 — UI (mocked data / sandbox shell)
**Status: COMPLETE ✓**

The mock data layer built here becomes the permanent **sandbox mode** — not throwaway scaffolding.

### Completed
- [x] Login page with "Continue as Alice / Bob" (sandbox) and placeholder for Google sign-in (real mode)
- [x] Dashboard — two calendars side by side
- [x] Weekly grid with events positioned by time at 15-minute resolution
- [x] Event detail modal (title, time, description, notes)
- [x] Chat bar shell (non-functional, wired up in Phase 6)
- [x] Mock data: 5 events per user across current week

---

## Phase 3 — GraphQL API + DB
**Goal:** Real data, real queries. Test in GraphiQL playground — no frontend changes yet.

### Go setup
- [ ] `go mod init cally-pal`
- [ ] gqlgen schema matches Phase 1 DB shape
- [ ] `go generate` runs cleanly

### Resolvers
- [ ] `me` — return hardcoded user (auth comes later)
- [ ] `calendarByShareId` — fetch calendar by share_id
- [ ] `events(calendarId, from, to)` — fetch events in range
- [ ] `findAvailableSlots` — the core slot-finding algorithm
- [ ] `createCalendar` mutation
- [ ] `createEvent` mutation
- [ ] `deleteEvent` mutation
- [ ] `scheduleMeeting` mutation — creates event on multiple calendars

### DB
- [ ] `DATABASE_URL` in `.env` (find via Supabase Connect → ORMs or Direct connection tab)
- [ ] Seed script — inserts same Alice + Bob mock data into real DB for sandbox mode

### Done when
- [x] `go run ./cmd/api` starts without errors
- [x] GraphiQL at `http://localhost:8081/playground`
- [x] `createCalendar` and `createEvent` mutations work
- [x] `findAvailableSlots` returns correct gaps around real events

### Test
User opens GraphiQL, runs queries manually.

**Status: COMPLETE ✓**

---

## Phase 4 — Wire UI to API
**Goal:** Replace mocked data in the frontend with real GraphQL queries.

### Frontend changes
- [ ] Install urql
- [ ] GraphQL client pointed at `http://localhost:8080/query`
- [ ] Sandbox mode: still uses mock data (no API call)
- [ ] Real mode: replace calendars + events with GraphQL queries
- [ ] Chat bar calls `findAvailableSlots` and shows returned time slots
- [ ] Confirm button on a slot calls `scheduleMeeting`

### Done when
- Sandbox mode still works with mock data
- Real mode loads events from DB
- Typing in chat bar + submitting finds real slots
- Clicking confirm creates real events in DB

### Test
User runs both servers, books a meeting end to end in real mode.

---

## Phase 5 — Auth (Google OAuth)
**Goal:** Real users via Google sign-in. Google Calendar data pulled after OAuth.

### Sign-in
- [ ] Google OAuth via Supabase Auth (configured in Supabase dashboard)
- [ ] Supabase JS client in frontend handles the OAuth redirect flow
- [ ] JWT middleware in Go verifies Supabase-issued token via JWKS URL
- [ ] `me` resolver returns real user from JWT

### Google Calendar access
- [ ] Google Cloud Console — enable Calendar API, add calendar scope to OAuth app
- [ ] After sign-in, exchange/store Google access token for Calendar API calls
- [ ] Go backend fetches Google Calendar events via Calendar API (not our DB)
- [ ] Events mapped to our `CalendarEvent` type so the UI doesn't change

### Login page update
- [ ] "Sign in with Google" button → real OAuth flow
- [ ] "Try Sandbox Mode" button → existing Alice/Bob mock flow
- [ ] Redirect to login if not authenticated in real mode

### Done when
- Two browser windows, two real Google accounts
- Each sees their real Google Calendar events
- Cross-user slot finding works on real calendar data

### Test
User signs in with two Google accounts, finds a mutual slot on real calendars.

---

## Phase 6 — MCP Layer
**Goal:** An AI agent can schedule meetings by talking to the MCP server.

### MCP tools
- [ ] `list_calendars` — agent can discover available calendars
- [ ] `find_available_slots(calendarIds, durationMinutes, after?, rangeStart?, rangeEnd?)` — returns time slot options
- [ ] `schedule_meeting(calendarIds, title, startAt, endAt)` — books the slot on both calendars
- [ ] Sandbox mode: tools work against mock data
- [ ] Real mode: tools work against Google Calendar / our DB

### Server
- [ ] `cmd/mcp/main.go` — mcp-go with SSE transport
- [ ] Tools call `internal/services` directly (same logic as GraphQL resolvers)
- [ ] Deployed to Railway alongside the API

### Done when
- MCP server running and connected to Claude
- Can type "find us a 2 hour slot next week" and get real options back
- Can confirm and have it book on both calendars

### Test
User connects MCP server to Claude, has a natural language scheduling conversation.

---

## Deployment checklist (after all phases)
- [ ] Frontend deployed to Vercel
- [ ] API + MCP deployed to Railway
- [ ] Supabase project on free tier
- [ ] Google Cloud Console — OAuth app configured with correct redirect URIs for prod
- [ ] Environment variables set in Railway + Vercel dashboards
- [ ] Shareable link works end to end in both sandbox and real mode

---

## Current status
**Active phase: 4 — Auth (Google OAuth)**
