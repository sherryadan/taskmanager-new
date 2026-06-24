import { supabase } from './supabase'
import type { TaskShare } from '../types'

export async function shareTask(taskId: string, sharedWith: string, sharedBy: string): Promise<TaskShare> {
  const { data, error } = await supabase
    .from('task_shares')
    .insert([{ task_id: taskId, shared_with: sharedWith, shared_by: sharedBy }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokeShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('task_shares')
    .delete()
    .eq('id', shareId)
  if (error) throw error
}

export async function getTaskShares(taskId: string): Promise<(TaskShare & { shared_with_email?: string })[]> {
  const { data, error } = await supabase
    .from('task_shares')
    .select('*')
    .eq('task_id', taskId)
  if (error) throw error
  if (!data) return []

  const userIds = data.map((s) => s.shared_with)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in('id', userIds)

  const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || [])

  return data.map((share) => ({
    ...share,
    shared_with_email: emailMap.get(share.shared_with) || 'unknown',
  }))
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getSharedTasks(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('task_shares')
    .select('task_id')
    .eq('shared_with', userId)
  if (error) throw error
  return data?.map((s) => s.task_id) || []
}
