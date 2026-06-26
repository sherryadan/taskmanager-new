import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListTodo,
  Users,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../store/useStore'
import { cn } from '../../utils/helpers'

export function Sidebar() {
  const { user, signOut } = useAuth()
  const {
    isDarkMode,
    toggleDarkMode,
    sidebarOpen,
    setSidebarOpen,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useStore()

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
    { to: '/shared', label: 'Shared', icon: Users },
    { to: '/profile', label: 'Profile', icon: UserCircle },
  ]

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700">
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          TaskFlow
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="space-y-1">
          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
        {user && (
          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <p className="truncate px-3 text-xs text-slate-500 dark:text-slate-500">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900 lg:shadow-none',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:z-40 lg:translate-x-0',
          sidebarOpen ? 'lg:w-64' : 'lg:w-16'
        )}
      >
        {/* Mobile close */}
        <div className="flex h-14 items-center justify-end border-b border-slate-200 px-4 lg:hidden dark:border-slate-700">
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Desktop toggle (hidden on mobile) */}
        <div className="hidden h-16 items-center justify-between border-b border-slate-200 px-4 lg:flex dark:border-slate-700">
          {sidebarOpen && (
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              TaskFlow
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Desktop nav (hidden on mobile, visible on lg) */}
        <div className="hidden flex-1 space-y-1 overflow-y-auto p-3 lg:block">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )
              }
            >
              <link.icon size={20} />
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Desktop bottom */}
        <div className="hidden border-t border-slate-200 p-3 lg:block dark:border-slate-700">
          <div className="space-y-1">
            <button
              onClick={toggleDarkMode}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              {sidebarOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
          {sidebarOpen && user && (
            <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
              <p className="truncate px-3 text-xs text-slate-500 dark:text-slate-500">
                {user.email}
              </p>
            </div>
          )}
        </div>

        {/* Mobile content (full sidebar) */}
        <div className="flex flex-1 flex-col overflow-y-auto lg:hidden">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
