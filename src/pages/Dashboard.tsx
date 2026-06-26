import { useEffect, useState, type ReactNode } from 'react'
import { ListTodo, CheckCircle2, Clock, Users, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { StatCard } from '../components/dashboard/StatCard'
import { ProgressBar } from '../components/dashboard/ProgressBar'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { Card } from '../components/ui/Card'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import { getTaskActivity } from '../services/tasks'
import type { Activity } from '../types'

export function Dashboard() {
  const { user } = useAuth()
  const { stats, myTasks, allTasks, loading } = useTasks()
  const [activities, setActivities] = useState<Activity[]>([])
  const [aiInsight, setAiInsight] = useState('')

  useEffect(() => {
    if (allTasks.length > 0) {
      Promise.all(
        allTasks.slice(0, 5).map((t) => getTaskActivity(t.id))
      ).then((results) => {
        const all = results.flat().sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setActivities(all.slice(0, 10))
      })
    }
  }, [allTasks])

  useEffect(() => {
    if (stats.total > 0) {
      const completionRate = Math.round((stats.completed / stats.total) * 100)
      const overdueCount = myTasks.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length

      let insight = ''
      if (completionRate >= 80) {
        insight = "Great progress! You're completing most of your tasks on time."
      } else if (overdueCount > 3) {
        insight = `You have ${overdueCount} overdue tasks. Consider reprioritizing.`
      } else if (stats.pending > stats.inProgress) {
        insight = `${stats.pending} tasks are pending. Try starting with high-priority items.`
      } else if (stats.total > 0) {
        insight = `You're actively working on ${stats.inProgress} tasks. Keep up the momentum!`
      }
      setAiInsight(insight)
    }
  }, [stats, myTasks])

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const statCards: { title: string; value: number; icon: ReactNode; color: string }[] = [
    { title: 'Total Tasks', value: stats.total, icon: <ListTodo size={22} className="text-indigo-600" />, color: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { title: 'Completed', value: stats.completed, icon: <CheckCircle2 size={22} className="text-emerald-600" />, color: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'In Progress', value: stats.inProgress, icon: <Clock size={22} className="text-amber-600" />, color: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Shared With Me', value: stats.shared, icon: <Users size={22} className="text-blue-600" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.email?.split('@')[0]}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="mb-6">
        <Card>
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="mt-0.5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Insight</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{aiInsight || 'Create your first task to get AI-powered insights.'}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <ProgressBar completed={stats.completed} total={stats.total} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
          <RecentActivity activities={activities} />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Productivity Tips</h3>
          <div className="space-y-3">
            {[
              { icon: TrendingUp, text: stats.completed > 0 ? `You've completed ${stats.completed} tasks. Great work!` : 'Start completing tasks to build momentum.', color: 'text-emerald-500' },
              { icon: AlertTriangle, text: myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length > 0 ? `${myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length} tasks are overdue.` : 'No overdue tasks. Stay on track!', color: 'text-amber-500' },
              { icon: Sparkles, text: 'Use Ctrl+K to quickly search and navigate.', color: 'text-indigo-500' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <tip.icon size={16} className={`mt-0.5 ${tip.color}`} />
                <p className="text-sm text-slate-600 dark:text-slate-400">{tip.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
