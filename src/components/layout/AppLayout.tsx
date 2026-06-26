import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ChatButton } from '../chat/ChatButton'
import { ChatPanel } from '../chat/ChatPanel'
import { useStore } from '../../store/useStore'

export function AppLayout() {
  const { sidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } = useStore()
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          TaskFlow
        </span>
      </header>

      <main
        className={`min-h-screen p-4 pt-20 transition-all duration-300 lg:p-6 lg:pt-6 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        <Outlet />
      </main>

      <ChatButton isOpen={chatOpen} onClick={() => setChatOpen(!chatOpen)} />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
