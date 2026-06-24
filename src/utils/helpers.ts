import { PRIORITY_ORDER } from './constants'
import type { Task, SortBy, SortOrder } from '../types'

export function formatDate(date: string | null): string {
  if (!date) return 'No due date'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isOverdue(date: string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date() && !isToday(date)
}

export function isToday(date: string): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function sortTasks(tasks: Task[], sortBy: SortBy, sortOrder: SortOrder): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'due_date':
        if (!a.due_date && !b.due_date) comparison = 0
        else if (!a.due_date) comparison = 1
        else if (!b.due_date) comparison = -1
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        break
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'priority':
        comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

export function filterBySearch(tasks: Task[], search: string): Task[] {
  if (!search) return tasks
  const q = search.toLowerCase()
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  )
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(email: string): string {
  return email.charAt(0).toUpperCase()
}

export function getTimeAgo(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}
