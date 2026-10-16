import type { Calendar, CalendarEvent, User } from '../types'

// Anchor everything to the current week so the calendar always looks populated
const now = new Date()
const monday = new Date(now)
monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // roll back to Monday
monday.setHours(0, 0, 0, 0)

function day(offset: number, hour: number, minute = 0): Date {
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d
}

export const MOCK_USERS: User[] = [
  {
    id: 'user-alice',
    email: 'alice@example.com',
    calendars: [],
  },
  {
    id: 'user-bob',
    email: 'bob@example.com',
    calendars: [],
  },
]

export const MOCK_CALENDARS: Calendar[] = [
  {
    id: 'cal-alice',
    userId: 'user-alice',
    name: "Alice's Calendar",
    timezone: 'UTC',
    shareId: 'share-alice-001',
  },
  {
    id: 'cal-bob',
    userId: 'user-bob',
    name: "Bob's Calendar",
    timezone: 'UTC',
    shareId: 'share-bob-001',
  },
]

export const MOCK_EVENTS: CalendarEvent[] = [
  // Alice's events
  {
    id: 'evt-1',
    calendarId: 'cal-alice',
    title: 'Team standup',
    description: 'Daily sync',
    startAt: day(0, 9),
    endAt: day(0, 9, 30),
  },
  {
    id: 'evt-2',
    calendarId: 'cal-alice',
    title: 'Design review',
    description: 'Q4 design review with stakeholders',
    startAt: day(1, 11),
    endAt: day(1, 12),
  },
  {
    id: 'evt-3',
    calendarId: 'cal-alice',
    title: 'Lunch with Sarah',
    startAt: day(2, 12, 30),
    endAt: day(2, 13, 30),
  },
  {
    id: 'evt-4',
    calendarId: 'cal-alice',
    title: '1:1 with manager',
    startAt: day(3, 14),
    endAt: day(3, 15),
  },
  {
    id: 'evt-5',
    calendarId: 'cal-alice',
    title: 'Sprint planning',
    description: 'Plan next sprint tickets',
    startAt: day(4, 10),
    endAt: day(4, 12),
  },

  // Bob's events
  {
    id: 'evt-6',
    calendarId: 'cal-bob',
    title: 'Client call',
    description: 'Weekly client check-in',
    startAt: day(0, 10),
    endAt: day(0, 11),
  },
  {
    id: 'evt-7',
    calendarId: 'cal-bob',
    title: 'Code review',
    startAt: day(1, 9),
    endAt: day(1, 10),
  },
  {
    id: 'evt-8',
    calendarId: 'cal-bob',
    title: 'Dentist',
    startAt: day(2, 14),
    endAt: day(2, 15, 30),
  },
  {
    id: 'evt-9',
    calendarId: 'cal-bob',
    title: 'Architecture meeting',
    description: 'Discuss new infra proposals',
    startAt: day(3, 11),
    endAt: day(3, 13),
  },
  {
    id: 'evt-10',
    calendarId: 'cal-bob',
    title: 'Team lunch',
    startAt: day(4, 12),
    endAt: day(4, 13),
  },
]
