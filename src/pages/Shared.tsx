import { useState } from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/tasks/TaskCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { TaskForm } from '../components/tasks/TaskForm'
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal'
import { TaskCardSkeleton } from '../components/ui/Skeleton'
import { ShareModal } from '../components/share/ShareModal'
import * as sharesService from '../services/shares'
import type { Task, TaskFormData } from '../types'

export function Shared() {
  const { user } = useAuth()
  const { sharedTasks, loading, editTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [sharingTask, setSharingTask] = useState<Task | null>(null)
  const [sharedUsers, setSharedUsers] = useState<{ id: string; email: string }[]>([])

  const handleEdit = async (data: TaskFormData) => {
    if (!editingTask) return
    await editTask(editingTask.id, data)
    setEditingTask(null)
  }

  const handleOpenShare = async (task: Task) => {
    setSharingTask(task)
    try {
      const shares = await sharesService.getTaskShares(task.id)
      setSharedUsers(
        shares.map((s) => ({
          id: s.id,
          email: s.shared_with_email || 'unknown',
        }))
      )
    } catch {
      setSharedUsers([])
    }
  }

  const handleShare = async (taskId: string, email: string) => {
    if (!user) return
    const foundUser = await sharesService.findUserByEmail(email)
    if (!foundUser) throw new Error('User not found')
    await sharesService.shareTask(taskId, foundUser.id, user.id)
    await handleOpenShare(sharingTask!)
  }

  const handleRevoke = async (shareId: string) => {
    await sharesService.revokeShare(shareId)
    if (sharingTask) {
      await handleOpenShare(sharingTask)
    }
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">Shared With Me</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Tasks shared by other users
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : sharedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-12 dark:border-slate-600">
          <Users size={40} className="mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">No shared tasks</h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Tasks shared with you will appear here
          </p>
          <Button variant="secondary" disabled>
            <Users size={18} className="mr-1" />
            Shared Tasks
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sharedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={() => {}}
              onShare={handleOpenShare}
            />
          ))}
        </div>
      )}

      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Update Task Status">
        <TaskForm task={editingTask} onSubmit={handleEdit} onCancel={() => setEditingTask(null)} />
      </Modal>

      {sharingTask && (
        <ShareModal
          isOpen={!!sharingTask}
          onClose={() => setSharingTask(null)}
          task={sharingTask}
          sharedUsers={sharedUsers}
          onShare={handleShare}
          onRevoke={handleRevoke}
        />
      )}
    </div>
  )
}
