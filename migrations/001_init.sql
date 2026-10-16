-- Cally-pal initial schema
-- All timestamps stored in UTC.
-- Run via Supabase dashboard: SQL editor → paste and run.

-- ============================================================
-- CALENDARS
-- Each user can have one or more calendars.
-- share_id is a stable public reference — safe to give to an
-- AI agent or another user without exposing the internal UUID.
-- ============================================================
CREATE TABLE IF NOT EXISTS calendars (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    timezone   TEXT NOT NULL DEFAULT 'UTC',   -- for display only, all times stored UTC
    share_id   UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- Belongs to a calendar. start_at must be before end_at.
-- description  — short summary shown in the calendar grid
-- notes        — longer free-text, shown in event detail view
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    notes       TEXT,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT events_start_before_end CHECK (start_at < end_at)
);

-- Index used by the slot-finding algorithm (range scans on a calendar)
CREATE INDEX IF NOT EXISTS events_calendar_time
    ON events (calendar_id, start_at, end_at);

-- ============================================================
-- ROW LEVEL SECURITY
--
-- The Go backend uses the service role key — bypasses RLS entirely.
-- These policies protect direct Supabase API / browser calls only.
--
-- Note on auth.uid(): wrapped in (select auth.uid()) so Postgres
-- evaluates it once per statement, not once per row — faster.
--
-- Note on WITH CHECK: required for INSERT and UPDATE.
-- USING alone on a FOR ALL policy only covers SELECT/UPDATE/DELETE.
-- We split into per-operation policies to be explicit and correct.
-- ============================================================
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE events    ENABLE ROW LEVEL SECURITY;

-- ---- CALENDARS ----

-- Any authenticated user can read any calendar
-- (needed so agent / User B can look up a calendar by share_id)
CREATE POLICY "calendars_select"
    ON calendars FOR SELECT
    TO authenticated
    USING (true);

-- Only the owner can create a calendar for themselves
CREATE POLICY "calendars_insert"
    ON calendars FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

-- Only the owner can update their calendar
CREATE POLICY "calendars_update"
    ON calendars FOR UPDATE
    TO authenticated
    USING  ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Only the owner can delete their calendar
CREATE POLICY "calendars_delete"
    ON calendars FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ---- EVENTS ----

-- Any authenticated user can read any event
-- (needed for cross-user slot finding)
CREATE POLICY "events_select"
    ON events FOR SELECT
    TO authenticated
    USING (true);

-- Only the calendar owner can create events on their calendar
CREATE POLICY "events_insert"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        calendar_id IN (
            SELECT id FROM calendars
            WHERE user_id = (select auth.uid())
        )
    );

-- Only the calendar owner can update events on their calendar
CREATE POLICY "events_update"
    ON events FOR UPDATE
    TO authenticated
    USING (
        calendar_id IN (
            SELECT id FROM calendars
            WHERE user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        calendar_id IN (
            SELECT id FROM calendars
            WHERE user_id = (select auth.uid())
        )
    );

-- Only the calendar owner can delete events on their calendar
CREATE POLICY "events_delete"
    ON events FOR DELETE
    TO authenticated
    USING (
        calendar_id IN (
            SELECT id FROM calendars
            WHERE user_id = (select auth.uid())
        )
    );
