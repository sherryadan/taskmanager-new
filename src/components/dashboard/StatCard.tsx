import { type ReactNode } from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../utils/helpers'

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
  color: string
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={cn('rounded-xl p-3', color)}>{icon}</div>
      </div>
    </Card>
  )
}
