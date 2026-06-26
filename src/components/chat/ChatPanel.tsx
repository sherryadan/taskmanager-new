import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { ChatMessage } from './ChatMessage'
import { getChatResponse, getInitialGreeting, setTaskContext, clearChatContext } from '../../services/ai'
import type { ChatMessage as ChatMessageType } from '../../types'
import { Send, Trash2, Sparkles } from 'lucide-react'

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { tasks } = useStore()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTaskContext(tasks)
      if (messages.length === 0) {
        setMessages([getInitialGreeting()])
      }
    }
  }, [isOpen, tasks])

  useEffect(() => {
    if (isOpen) {
      setTaskContext(tasks)
    }
  }, [tasks, isOpen])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    setTimeout(() => {
      const response = getChatResponse(text)
      setMessages((prev) => [...prev, response])
      setLoading(false)
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    clearChatContext()
    setTaskContext(tasks)
    setMessages([getInitialGreeting()])
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-indigo-600 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-200" />
          <span className="font-semibold text-white">AI Assistant</span>
        </div>
        <button
          onClick={handleClear}
          className="rounded-lg p-1.5 text-indigo-200 hover:bg-indigo-500 hover:text-white"
          title="Clear chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ maxHeight: '400px' }}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <Sparkles size={16} />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-700">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your tasks..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
