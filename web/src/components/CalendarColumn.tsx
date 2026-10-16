import type { Calendar, CalendarEvent } from '../types'
import EventBlock from './EventBlock'

interface Props {
  calendar: Calendar
  events: CalendarEvent[]
  weekDays: Date[]
  color: 'blue' | 'violet'
}

const HOURS        = Array.from({ length: 11 }, (_, i) => i + 8) // 8am – 6pm
const HOUR_HEIGHT  = 60   // px — 15px per 15-min block (60 / 4)
const QUARTER      = HOUR_HEIGHT / 4  // 15px
const GRID_START   = 8    // 8am

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

// Convert an event's time into pixel top + height within the grid
function eventPosition(event: CalendarEvent): { top: number; height: number } {
  const startMinutes = event.startAt.getHours() * 60 + event.startAt.getMinutes()
  const endMinutes   = event.endAt.getHours()   * 60 + event.endAt.getMinutes()
  const gridStartMin = GRID_START * 60

  const top    = ((startMinutes - gridStartMin) / 60) * HOUR_HEIGHT
  const height = Math.max((endMinutes - startMinutes) / 60 * HOUR_HEIGHT, 20) // min 20px

  return { top, height }
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
        {/* Time gutter — hour labels only */}
        <div className="w-12 shrink-0 border-r border-gray-100">
          <div className="h-8" /> {/* spacer for day header row */}
          {HOURS.map(h => (
            <div key={h} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-end pr-2 pt-1">
              <span className="text-[10px] text-gray-400">{h}:00</span>
            </div>
          ))}
        </div>

        {/* One column per day */}
        {weekDays.map(day => {
          const dayEvents = eventsForDay(events, day)
          return (
            <div key={day.toISOString()} className="flex flex-col flex-1 min-w-[100px] border-r border-gray-100 last:border-r-0">
              {/* Day header */}
              <div className="h-8 flex items-center justify-center border-b border-gray-100 shrink-0">
                <span className="text-xs font-medium text-gray-600">{formatDay(day)}</span>
              </div>

              {/* Time grid — fixed height, events absolutely positioned inside */}
              <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
                {/* Grid lines: solid at :00, dashed at :15/:30/:45 */}
                {HOURS.map(h =>
                  [0, 1, 2, 3].map(q => {
                    const top = (h - GRID_START) * HOUR_HEIGHT + q * QUARTER
                    const isHour = q === 0
                    return (
                      <div
                        key={`${h}-${q}`}
                        className={`absolute w-full ${isHour ? 'border-b border-gray-200' : 'border-b border-dashed border-gray-100'}`}
                        style={{ top }}
                      />
                    )
                  })
                )}

                {/* Events positioned by time */}
                {dayEvents.map(event => {
                  const { top, height } = eventPosition(event)
                  return (
                    <div
                      key={event.id}
                      className="absolute w-full px-0.5"
                      style={{ top, height }}
                    >
                      <EventBlock event={event} color={color} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
