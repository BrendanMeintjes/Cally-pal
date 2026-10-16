export interface Calendar {
  id: string
  userId: string
  name: string
  timezone: string
  shareId: string
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  notes?: string
  startAt: Date
  endAt: Date
}

export interface TimeSlot {
  startAt: Date
  endAt: Date
}

export interface User {
  id: string
  email: string
  calendars: Calendar[]
}
