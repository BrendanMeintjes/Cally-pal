package db

import (
	"context"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ---- Types ----

type Calendar struct {
	ID        string
	UserID    string
	Name      string
	Timezone  string
	ShareID   string
	CreatedAt time.Time
}

type Event struct {
	ID          string
	CalendarID  string
	Title       string
	Description *string
	Notes       *string
	StartAt     time.Time
	EndAt       time.Time
	CreatedAt   time.Time
}

// ---- Calendars ----

func GetCalendarsByUserID(ctx context.Context, pool *pgxpool.Pool, userID string) ([]Calendar, error) {
	rows, err := pool.Query(ctx, `
		SELECT id, user_id, name, timezone, share_id, created_at
		FROM calendars WHERE user_id = $1
		ORDER BY created_at ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Calendar
	for rows.Next() {
		var c Calendar
		if err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.Timezone, &c.ShareID, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func GetCalendarByShareID(ctx context.Context, pool *pgxpool.Pool, shareID string) (*Calendar, error) {
	var c Calendar
	err := pool.QueryRow(ctx, `
		SELECT id, user_id, name, timezone, share_id, created_at
		FROM calendars WHERE share_id = $1
	`, shareID).Scan(&c.ID, &c.UserID, &c.Name, &c.Timezone, &c.ShareID, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func CreateCalendar(ctx context.Context, pool *pgxpool.Pool, userID, name, timezone string) (*Calendar, error) {
	var c Calendar
	err := pool.QueryRow(ctx, `
		INSERT INTO calendars (user_id, name, timezone)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, name, timezone, share_id, created_at
	`, userID, name, timezone).Scan(&c.ID, &c.UserID, &c.Name, &c.Timezone, &c.ShareID, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// ---- Events ----

func GetEventsByCalendarID(ctx context.Context, pool *pgxpool.Pool, calendarID string, from, to *time.Time) ([]Event, error) {
	query := `
		SELECT id, calendar_id, title, description, notes, start_at, end_at, created_at
		FROM events
		WHERE calendar_id = $1
	`
	args := []any{calendarID}

	if from != nil {
		args = append(args, *from)
		query += ` AND end_at >= $` + itoa(len(args))
	}
	if to != nil {
		args = append(args, *to)
		query += ` AND start_at <= $` + itoa(len(args))
	}
	query += ` ORDER BY start_at ASC`

	rows, err := pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Event
	for rows.Next() {
		var e Event
		if err := rows.Scan(&e.ID, &e.CalendarID, &e.Title, &e.Description, &e.Notes, &e.StartAt, &e.EndAt, &e.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

func CreateEvent(ctx context.Context, pool *pgxpool.Pool, calendarID, title string, description, notes *string, startAt, endAt time.Time) (*Event, error) {
	var e Event
	err := pool.QueryRow(ctx, `
		INSERT INTO events (calendar_id, title, description, notes, start_at, end_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, calendar_id, title, description, notes, start_at, end_at, created_at
	`, calendarID, title, description, notes, startAt, endAt).Scan(
		&e.ID, &e.CalendarID, &e.Title, &e.Description, &e.Notes, &e.StartAt, &e.EndAt, &e.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func DeleteEvent(ctx context.Context, pool *pgxpool.Pool, id string) error {
	_, err := pool.Exec(ctx, `DELETE FROM events WHERE id = $1`, id)
	return err
}

func itoa(n int) string {
	return strconv.Itoa(n)
}
