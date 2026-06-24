import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as tasksService from '../services/tasks'
import { useStore } from '../store/useStore'
import type { TaskFormData, TaskFilters, Task, DashboardStats } from '../types'
import { sortTasks, filterBySearch } from '../utils/helpers'

export function useTasks() {
  const { user } = useAuth()
  const { tasks, setTasks, addTask, updateTaskInState, removeTask } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'due_date',
    sortOrder: 'asc',
  })

  const fetchTasks = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await tasksService.getTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [user, setTasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (data: TaskFormData) => {
    if (!user) return
    try {
      setError(null)
      const task = await tasksService.createTask({ ...data, owner_id: user.id, due_date: data.due_date || null } as any)
      addTask(task)
      await tasksService.logActivity(task.id, user.id, 'created', 'Task was created')
      return task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      throw err
    }
  }

  const editTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return
    try {
      setError(null)
      const task = await tasksService.updateTask(taskId, { ...updates, due_date: (updates as any).due_date || null })
      updateTaskInState(taskId, task)
      await tasksService.logActivity(taskId, user.id, 'updated', `Task was updated`)
      return task
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }

  const removeTaskById = async (taskId: string) => {
    try {
      setError(null)
      await tasksService.deleteTask(taskId)
      removeTask(taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }

  const filteredTasks = tasks ? (() => {
    let result = [...tasks]
    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status)
    }
    if (filters.priority !== 'all') {
      result = result.filter((t) => t.priority === filters.priority)
    }
    result = filterBySearch(result, filters.search)
    result = sortTasks(result, filters.sortBy, filters.sortOrder)
    return result
  })() : []

  const myTasks = tasks.filter((t) => t.owner_id === user?.id)
  const sharedTasks = tasks.filter((t) => t.owner_id !== user?.id)

  const stats: DashboardStats = {
    total: myTasks.length,
    completed: myTasks.filter((t) => t.status === 'completed').length,
    pending: myTasks.filter((t) => t.status === 'pending').length,
    inProgress: myTasks.filter((t) => t.status === 'in_progress').length,
    shared: sharedTasks.length,
  }

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    myTasks,
    sharedTasks,
    stats,
    loading,
    error,
    filters,
    setFilters,
    createTask,
    editTask,
    removeTaskById,
    refresh: fetchTasks,
  }
}
