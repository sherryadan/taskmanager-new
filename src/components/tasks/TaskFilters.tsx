import { Search, SlidersHorizontal, LayoutList, LayoutGrid } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { TaskFilters as TaskFiltersType, ViewMode } from '../../types'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: TaskFiltersType) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  totalCount: number
}

export function TaskFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalCount,
}: TaskFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-slate-400" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {totalCount} task{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange('list')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'list'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="w-full sm:flex-1 sm:min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as TaskFiltersType['status'] })}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="flex-1 sm:w-36"
          />
          <Select
            value={filters.priority}
            onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as TaskFiltersType['priority'] })}
            options={[
              { value: 'all', label: 'All Priority' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            className="flex-1 sm:w-36"
          />
          <Select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as TaskFiltersType['sortBy'] })}
            options={[
              { value: 'due_date', label: 'Due Date' },
              { value: 'created_at', label: 'Created' },
              { value: 'priority', label: 'Priority' },
              { value: 'title', label: 'Title' },
            ]}
            className="flex-1 sm:w-36"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onFiltersChange({
                ...filters,
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </Button>
        </div>
      </div>
    </div>
  )
}
