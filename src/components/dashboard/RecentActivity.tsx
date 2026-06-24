import type { Activity } from '../../types'
import { Badge } from '../ui/Badge'
import { getTimeAgo } from '../../utils/helpers'

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        No recent activity
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 10).map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {activity.action}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activity.details}
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {getTimeAgo(activity.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
