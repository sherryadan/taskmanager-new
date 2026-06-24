import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Page not found</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button>
            <Home size={18} className="mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
