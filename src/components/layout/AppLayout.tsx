import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useStore } from '../../store/useStore'

export function AppLayout() {
  const { sidebarOpen } = useStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        } min-h-screen p-6`}
      >
        <Outlet />
      </main>
    </div>
  )
}
