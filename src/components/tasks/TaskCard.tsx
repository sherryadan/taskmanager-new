import { Calendar, Pencil, Trash2, Share2, Clock } from 'lucide-react'
import type { Task } from '../../types'
import { Badge } from '../ui/Badge'
import { PRIORITY_COLORS, STATUS_COLORS, PRIORITY_LABELS, STATUS_LABELS } from '../../utils/constants'
import { formatDate, isOverdue, getTimeAgo } from '../../utils/helpers'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onShare: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onShare }: TaskCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="line-clamp-2 flex-1 text-base font-semibold text-slate-900 dark:text-white">
          {task.title}
        </h3>
        <div className="flex shrink-0 gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onShare(task)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700"
            title="Share"
          >
            <Share2 size={15} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-700"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={PRIORITY_COLORS[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <Badge className={STATUS_COLORS[task.status]}>
          {STATUS_LABELS[task.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          <span className={isOverdue(task.due_date) && task.status !== 'completed' ? 'text-rose-500 font-medium' : ''}>
            {formatDate(task.due_date)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {getTimeAgo(task.updated_at)}
        </span>
      </div>
    </div>
  )
}
