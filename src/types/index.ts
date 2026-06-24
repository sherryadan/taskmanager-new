export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'in_progress' | 'completed'

export interface Task {
  id: string
  owner_id: string
  title: string
  description: string
  priority: Priority
  status: Status
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  status: Status
  due_date: string
}

export interface TaskShare {
  id: string
  task_id: string
  shared_with: string
  shared_by: string
  created_at: string
  shared_with_email?: string
}

export interface Profile {
  id: string
  email: string
  avatar_url?: string
  full_name?: string
}

export interface DashboardStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  shared: number
}

export type ViewMode = 'list' | 'grid'
export type SortBy = 'due_date' | 'created_at' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface TaskFilters {
  search: string
  status: Status | 'all'
  priority: Priority | 'all'
  sortBy: SortBy
  sortOrder: SortOrder
}

export interface Activity {
  id: string
  task_id: string
  user_id: string
  action: string
  details: string
  created_at: string
}
