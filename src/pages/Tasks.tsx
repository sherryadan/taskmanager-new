import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { useStore } from '../store/useStore'
import { useRealtimeTasks } from '../hooks/useRealtime'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskFiltersBar } from '../components/tasks/TaskFilters'
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal'
import { ShareModal } from '../components/share/ShareModal'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { TaskCardSkeleton } from '../components/ui/Skeleton'
import * as sharesService from '../services/shares'
import type { Task, TaskFormData } from '../types'

export function Tasks() {
  const { user } = useAuth()
  const { tasks, stats, loading, filters, setFilters, createTask, editTask, removeTaskById, refresh } = useTasks()
  const { viewMode, setViewMode } = useStore()

  useRealtimeTasks(user?.id)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [sharingTask, setSharingTask] = useState<Task | null>(null)
  const [sharedUsers, setSharedUsers] = useState<{ id: string; email: string }[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  const handleCreate = async (data: TaskFormData) => {
    await createTask(data)
    setIsCreateOpen(false)
  }

  const handleEdit = async (data: TaskFormData) => {
    if (!editingTask) return
    await editTask(editingTask.id, data)
    setEditingTask(null)
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    setActionLoading(true)
    try {
      await removeTaskById(deletingTask.id)
      setDeletingTask(null)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenShare = useCallback(async (task: Task) => {
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
  }, [])

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
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {stats.completed}/{stats.total} completed
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus size={18} className="mr-1" />
          New Task
        </Button>
      </div>

      <TaskFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={tasks.length}
      />

      {loading ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {[...Array(6)].map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-12 dark:border-slate-600">
          <Plus size={40} className="mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">No tasks yet</h3>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Create your first task to get started
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} className="mr-1" />
            Create Task
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              onShare={handleOpenShare}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <TaskForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        <TaskForm task={editingTask} onSubmit={handleEdit} onCancel={() => setEditingTask(null)} />
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
      />

      {/* Share Modal */}
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
