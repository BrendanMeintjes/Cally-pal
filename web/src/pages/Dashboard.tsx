import CalendarColumn from '../components/CalendarColumn'
import ChatBar from '../components/ChatBar'
import { MOCK_CALENDARS, MOCK_EVENTS } from '../lib/mockData'

interface Props {
  userId: string
  onLogout: () => void
}

// Generate Mon–Fri of the current week
function getCurrentWeek(): Date[] {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function Dashboard({ userId, onLogout }: Props) {
  const weekDays = getCurrentWeek()

  const myCalendar    = MOCK_CALENDARS.find(c => c.userId === userId)!
  const otherCalendar = MOCK_CALENDARS.find(c => c.userId !== userId)!

  const myEvents    = MOCK_EVENTS.filter(e => e.calendarId === myCalendar.id)
  const otherEvents = MOCK_EVENTS.filter(e => e.calendarId === otherCalendar.id)

  const isAlice = userId === 'user-alice'
  const email   = isAlice ? 'alice@example.com' : 'bob@example.com'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Cally-pal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{email}</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Calendars */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        <CalendarColumn
          calendar={myCalendar}
          events={myEvents}
          weekDays={weekDays}
          color={isAlice ? 'blue' : 'violet'}
        />
        <CalendarColumn
          calendar={otherCalendar}
          events={otherEvents}
          weekDays={weekDays}
          color={isAlice ? 'violet' : 'blue'}
        />
      </div>

      {/* AI chat bar */}
      <ChatBar />
    </div>
  )
}
