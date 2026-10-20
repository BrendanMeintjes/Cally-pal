package services

import (
	"sort"
	"time"

	"cally-pal/internal/db"
)

type TimeSlot struct {
	StartAt time.Time
	EndAt   time.Time
}

// FindAvailableSlots returns windows where ALL provided calendars are free.
//
// events        — combined events from every calendar being checked
// duration      — how long the meeting needs to be
// after         — earliest the slot can start (defaults to now)
// rangeStart/End — optional window constraint ("between 2-5pm next week")
func FindAvailableSlots(events []db.Event, duration time.Duration, after time.Time, rangeStart, rangeEnd *time.Time) []TimeSlot {
	// Define the search window
	searchStart := after
	searchEnd := after.Add(14 * 24 * time.Hour) // default: look 2 weeks ahead

	if rangeStart != nil && rangeStart.After(searchStart) {
		searchStart = *rangeStart
	}
	if rangeEnd != nil {
		searchEnd = *rangeEnd
	}

	// Filter events that overlap the search window
	var busy []db.Event
	for _, e := range events {
		if e.EndAt.After(searchStart) && e.StartAt.Before(searchEnd) {
			busy = append(busy, e)
		}
	}

	// Sort by start time
	sort.Slice(busy, func(i, j int) bool {
		return busy[i].StartAt.Before(busy[j].StartAt)
	})

	// Merge overlapping busy blocks so we don't double-count
	merged := mergeBusy(busy)

	// Walk the gaps between busy blocks and collect ones >= duration
	var slots []TimeSlot
	cursor := searchStart

	for _, b := range merged {
		if b.StartAt.Sub(cursor) >= duration {
			slots = append(slots, TimeSlot{
				StartAt: cursor,
				EndAt:   cursor.Add(duration),
			})
		}
		if b.EndAt.After(cursor) {
			cursor = b.EndAt
		}
	}

	// Check the final gap after the last event
	if searchEnd.Sub(cursor) >= duration {
		slots = append(slots, TimeSlot{
			StartAt: cursor,
			EndAt:   cursor.Add(duration),
		})
	}

	return slots
}

type busyBlock struct {
	StartAt time.Time
	EndAt   time.Time
}

// mergeBusy collapses overlapping events into contiguous busy blocks.
func mergeBusy(events []db.Event) []busyBlock {
	if len(events) == 0 {
		return nil
	}

	merged := []busyBlock{{events[0].StartAt, events[0].EndAt}}

	for _, e := range events[1:] {
		last := &merged[len(merged)-1]
		if !e.StartAt.After(last.EndAt) {
			// Overlapping or adjacent — extend the block
			if e.EndAt.After(last.EndAt) {
				last.EndAt = e.EndAt
			}
		} else {
			merged = append(merged, busyBlock{e.StartAt, e.EndAt})
		}
	}

	return merged
}
