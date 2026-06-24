import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useStore } from '../store/useStore'
import type { Task } from '../types'

export function useRealtimeTasks(userId: string | undefined) {
  const { updateTaskInState, addTask, removeTask } = useStore()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          const task = payload.new as Task
          const oldTask = payload.old as Task

          switch (payload.eventType) {
            case 'INSERT':
              addTask(task)
              break
            case 'UPDATE':
              if (task) updateTaskInState(task.id, task)
              break
            case 'DELETE':
              if (oldTask) removeTask(oldTask.id)
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, addTask, updateTaskInState, removeTask])
}
