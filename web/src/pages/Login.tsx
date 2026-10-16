interface Props {
  onLogin: (userId: string) => void
}

export default function Login({ onLogin }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Cally-pal</h1>
          <p className="text-gray-500 text-sm">AI-powered scheduling for two</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-400 text-center uppercase tracking-wide">
            Sign in as (mock)
          </p>
          <button
            onClick={() => onLogin('user-alice')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Continue as Alice
          </button>
          <button
            onClick={() => onLogin('user-bob')}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Continue as Bob
          </button>
        </div>

        <p className="text-center text-xs text-gray-300">
          Real auth coming in Phase 5
        </p>
      </div>
    </div>
  )
}
