import { useState, type FormEvent } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { findUserByEmail } from '../../services/shares'
import { useAuth } from '../../contexts/AuthContext'
import type { Task } from '../../types'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task
  sharedUsers: { id: string; email: string }[]
  onShare: (taskId: string, email: string) => Promise<void>
  onRevoke: (shareId: string) => Promise<void>
}

export function ShareModal({ isOpen, onClose, task, sharedUsers, onShare, onRevoke }: ShareModalProps) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [searchResult, setSearchResult] = useState<{ id: string; email: string } | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!email.trim()) return
    setSearching(true)
    setError('')
    setSearchResult(null)
    try {
      const result = await findUserByEmail(email.trim())
      if (result) {
        setSearchResult(result)
      } else {
        setError('No user found with this email')
      }
    } catch {
      setError('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleShare = async () => {
    if (!searchResult) return
    try {
      await onShare(task.id, searchResult.email)
      setEmail('')
      setSearchResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share task')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share: ${task.title}`} size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Share with user by email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="Enter user email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <Button size="sm" onClick={handleSearch} loading={searching}>
              Search
            </Button>
          </div>
          {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
        </div>

        {searchResult && (
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {searchResult.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-slate-900 dark:text-white">{searchResult.email}</span>
            </div>
            <Button size="sm" onClick={handleShare}>
              <UserPlus size={15} className="mr-1" />
              Share
            </Button>
          </div>
        )}

        {sharedUsers.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Shared with ({sharedUsers.length})
            </h4>
            <div className="space-y-2">
              {sharedUsers.map((su) => (
                <div
                  key={su.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {su.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-white">{su.email}</span>
                  </div>
                  <button
                    onClick={() => onRevoke(su.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                    title="Revoke access"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
