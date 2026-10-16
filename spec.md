# Cally-pal — Build Spec

## App summary
Two users, each with a calendar full of events. An AI agent can be asked to find a time that works for both — "schedule us for 2 hours at my next available spot" — and it finds or creates the meeting without clashing.

---

## Phase 1 — DB Schema
**Goal:** Agree on the data shapes before writing a line of code. Everything downstream depends on this.

### Tables
- [x] `calendars` — id, user_id, name, timezone (default UTC), share_id
- [x] `events` — id, calendar_id, title, description, notes, start_at, end_at

### Confirmed decisions
- [x] Events have `description` (TEXT, nullable) and `notes` (TEXT, nullable)
- [x] Timezone stored on calendar, not on events. All times stored in UTC. Display timezone per-user later
- [x] Cross-user access via `share_id` — agent is given both calendar share_ids to find and book mutual slots
- [x] Agent books directly on both calendars via `scheduleMeeting`. Email invite is future work

### Done when
- [x] SQL migration file written and reviewed together
- [x] Both agree on column names and types
- [x] RLS policies written and verified against current Supabase docs
- [x] Migration run in Supabase dashboard
- [x] .env filled in with all keys

### Test
Read through the SQL file together. No running code yet.

**Status: COMPLETE ✓**

---

## Phase 2 — UI (mocked data)
**Goal:** See and interact with the app in a browser. No backend, no auth — just hardcoded data and the real UI components.

### Pages
- [ ] Login page (static, no real auth yet — just a button that "logs you in")
- [ ] Dashboard — shows two calendars side by side
- [ ] Calendar view — weekly grid with events rendered as blocks
- [ ] Event detail (click an event → see title, time)
- [ ] Chat bar at the bottom — text input (no AI yet, just the UI shell)

### Mock data
- [ ] Two hardcoded users with two hardcoded calendars
- [ ] ~5 events each spread across the current week

### Done when
- [x] `npm run dev` shows a working UI
- [x] Both calendars visible with events
- [x] Chat bar present (non-functional)
- [x] Events positioned correctly by time with 15-minute grid resolution
- [x] Event detail modal works
- [x] Login/logout works for both users

### Test
User runs `cd web && npm run dev`, opens browser, clicks around.

**Status: COMPLETE ✓**

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
- [ ] `findAvailableSlots` — the core algorithm
- [ ] `createCalendar` mutation
- [ ] `createEvent` mutation
- [ ] `deleteEvent` mutation
- [ ] `scheduleMeeting` mutation — creates event on multiple calendars

### DB
- [ ] Supabase project created
- [ ] Migration run
- [ ] `DATABASE_URL` in `.env`
- [ ] Seed script with same mock data as Phase 2

### Done when
- `go run ./cmd/api` starts without errors
- GraphiQL at `http://localhost:8080/playground`
- Can run `findAvailableSlots` query and get real results

### Test
User opens GraphiQL, runs queries manually.

---

## Phase 4 — Wire UI to API
**Goal:** Replace mocked data in the frontend with real GraphQL queries.

### Frontend changes
- [ ] Install urql
- [ ] GraphQL client pointed at `http://localhost:8080/query`
- [ ] Replace mock calendars with `calendarByShareId` query
- [ ] Replace mock events with `events` query
- [ ] Chat bar calls `findAvailableSlots` and shows returned time slots
- [ ] Confirm button on a slot calls `scheduleMeeting`

### Done when
- Real events from DB appear in the calendar grid
- Typing in chat bar + submitting finds real slots
- Clicking confirm creates real events in DB

### Test
User runs both servers, books a meeting end to end.

---

## Phase 5 — Auth
**Goal:** Real users, real sessions. Each user sees only their own data.

### Backend
- [ ] Supabase Auth enabled
- [ ] JWT middleware in Go — extract user ID from Bearer token
- [ ] All resolvers use `auth.FromContext(ctx)` for user ID
- [ ] `me` resolver returns real user from JWT

### Frontend
- [ ] Supabase JS client installed
- [ ] Login page — real email/password sign-in via Supabase Auth
- [ ] Auth token stored, sent as `Authorization: Bearer <token>` on every GraphQL request
- [ ] Logout button
- [ ] Redirect to login if not authenticated

### Done when
- Two separate browser sessions, two different users
- Each sees only their own calendar on the dashboard
- Cross-user slot finding still works via share_id

### Test
User opens two browser windows, logs in as different users, finds a mutual slot.

---

## Phase 6 — MCP Layer
**Goal:** An AI agent can schedule meetings by talking to the MCP server.

### MCP tools
- [ ] `list_calendars` — agent can discover available calendars
- [ ] `find_available_slots(calendarIds, durationMinutes, after?, rangeStart?, rangeEnd?)` — returns time slot options
- [ ] `schedule_meeting(calendarIds, title, startAt, endAt)` — books the slot on both calendars

### Server
- [ ] `cmd/mcp/main.go` — mcp-go with SSE transport
- [ ] Tools call `internal/services` directly (same logic as GraphQL resolvers)
- [ ] Deployed to Railway alongside the API

### Done when
- MCP server running and connected to Claude (or another agent)
- Can type "find us a 2 hour slot next week" and get real options back
- Can confirm and have it book on both calendars

### Test
User connects MCP server to Claude, has a natural language scheduling conversation.

---

## Deployment checklist (after all phases)
- [ ] Frontend deployed to Vercel
- [ ] API + MCP deployed to Railway
- [ ] Supabase project on free tier
- [ ] Environment variables set in Railway + Vercel dashboards
- [ ] Shareable link works end to end

---

## Current status
**Active phase: 3 — GraphQL API + DB**
