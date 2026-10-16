import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)

  if (!userId) {
    return <Login onLogin={setUserId} />
  }

  return <Dashboard userId={userId} onLogout={() => setUserId(null)} />
}
