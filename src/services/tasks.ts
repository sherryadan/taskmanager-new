import { supabase } from './supabase'
import type { Task, TaskFormData, Activity } from '../types'

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  if (error) throw error
  return data
}

export async function createTask(task: TaskFormData & { owner_id: string }): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
  if (error) throw error
}

export async function logActivity(
  taskId: string,
  userId: string,
  action: string,
  details: string
): Promise<void> {
  const { error } = await supabase
    .from('task_activity')
    .insert([{ task_id: taskId, user_id: userId, action, details }])
  if (error) console.error('Failed to log activity:', error)
}

export async function getTaskActivity(taskId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('task_activity')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data || []
}
