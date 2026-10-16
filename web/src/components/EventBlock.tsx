import { useState } from 'react'
import type { CalendarEvent } from '../types'

interface Props {
  event: CalendarEvent
  color: 'blue' | 'violet'
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function EventBlock({ event, color }: Props) {
  const [showDetail, setShowDetail] = useState(false)

  const colors = {
    blue:   'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200',
    violet: 'bg-violet-100 border-violet-400 text-violet-900 hover:bg-violet-200',
  }

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        className={`w-full text-left border-l-4 rounded px-2 py-1 text-xs cursor-pointer transition-colors ${colors[color]}`}
      >
        <div className="font-semibold truncate">{event.title}</div>
        <div className="opacity-70">{formatTime(event.startAt)} – {formatTime(event.endAt)}</div>
      </button>

      {/* Event detail modal */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-80 space-y-2"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">{event.title}</h3>
            <p className="text-sm text-gray-500">
              {formatTime(event.startAt)} – {formatTime(event.endAt)}
            </p>
            {event.description && (
              <p className="text-sm text-gray-700">{event.description}</p>
            )}
            {event.notes && (
              <p className="text-sm text-gray-500 italic">{event.notes}</p>
            )}
            <button
              onClick={() => setShowDetail(false)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
