import type { Calendar, CalendarEvent } from '../types'
import EventBlock from './EventBlock'

interface Props {
  calendar: Calendar
  events: CalendarEvent[]
  weekDays: Date[]
  color: 'blue' | 'violet'
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8am – 6pm

function formatDay(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter(e => {
    const d = new Date(e.startAt)
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate()
    )
  })
}

export default function CalendarColumn({ calendar, events, weekDays, color }: Props) {
  const headerColors = {
    blue:   'bg-blue-600',
    violet: 'bg-violet-600',
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 border border-gray-200 rounded-xl overflow-hidden">
      {/* Calendar header */}
      <div className={`${headerColors[color]} text-white px-4 py-3`}>
        <div className="font-semibold">{calendar.name}</div>
      </div>

      {/* Day columns */}
      <div className="flex flex-1 overflow-x-auto">
        {/* Time gutter */}
        <div className="w-12 shrink-0 border-r border-gray-100">
          <div className="h-8" /> {/* spacer for day header row */}
          {HOURS.map(h => (
            <div key={h} className="h-14 flex items-start justify-end pr-2 pt-1">
              <span className="text-[10px] text-gray-400">{h}:00</span>
            </div>
          ))}
        </div>

        {/* One column per day */}
        {weekDays.map(day => {
          const dayEvents = eventsForDay(events, day)
          return (
            <div key={day.toISOString()} className="flex flex-col flex-1 min-w-[90px] border-r border-gray-100 last:border-r-0">
              {/* Day header */}
              <div className="h-8 flex items-center justify-center border-b border-gray-100">
                <span className="text-xs font-medium text-gray-600">{formatDay(day)}</span>
              </div>

              {/* Hour slots */}
              <div className="relative">
                {HOURS.map(h => (
                  <div key={h} className="h-14 border-b border-gray-50" />
                ))}

                {/* Events overlaid */}
                <div className="absolute inset-0 p-0.5 space-y-0.5">
                  {dayEvents.map(event => (
                    <EventBlock key={event.id} event={event} color={color} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
