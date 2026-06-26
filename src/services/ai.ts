import type { Task, ChatMessage } from '../types'

function analyzeTasks(tasks: Task[]): string {
  const total = tasks.length
  if (total === 0) return "You haven't created any tasks yet."

  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const overdue = tasks.filter(
    (t) => t.due_date! && new Date(t.due_date!!) < new Date() && t.status !== 'completed'
  ).length
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length
  const dueSoon = tasks.filter((t) => {
    if (!t.due_date! || t.status === 'completed') return false
    const due = new Date(t.due_date!!)
    const now = new Date()
    const diff = due.getTime() - now.getTime()
    return diff > 0 && diff <= 86400000 * 3
  }).length

  const insights: string[] = []
  insights.push(`You have ${total} total tasks: ${completed} completed, ${inProgress} in progress, ${pending} pending.`)
  if (overdue > 0) insights.push(`⚠️ ${overdue} task${overdue > 1 ? 's are' : ' is'} overdue.`)
  if (highPriority > 0) insights.push(`🔴 ${highPriority} high-priority task${highPriority > 1 ? 's' : ''} need${highPriority === 1 ? 's' : ''} attention.`)
  if (dueSoon > 0) insights.push(`⏰ ${dueSoon} task${dueSoon > 1 ? 's' : ''} due${dueSoon === 1 ? 's' : ''} within 3 days.`)
  if (completed > 0) {
    const rate = Math.round((completed / total) * 100)
    insights.push(`📊 Completion rate: ${rate}%.`)
    if (rate >= 80) insights.push('🌟 Great progress! Keep it up.')
    else if (rate < 30) insights.push('💪 Try focusing on completing pending tasks.')
  }

  return insights.join('\n')
}

function generateSuggestion(tasks: Task[]): string {
  const incomplete = tasks.filter((t) => t.status !== 'completed')
  if (incomplete.length === 0) return 'All tasks completed! 🎉 Take a break or create new goals.'

  const overdue = incomplete.filter(
    (t) => t.due_date! && new Date(t.due_date!) < new Date()
  )
  if (overdue.length > 0) {
    return `📍 Start with overdue tasks. "${overdue[0].title}" is past due.`
  }

  const high = incomplete.filter((t) => t.priority === 'high')
  if (high.length > 0) {
    return `🎯 Focus on high-priority: "${high[0].title}".`
  }

  const dueSoon = incomplete.filter((t) => {
    if (!t.due_date!) return false
    const diff = new Date(t.due_date!).getTime() - new Date().getTime()
    return diff > 0 && diff <= 86400000 * 3
  })
  if (dueSoon.length > 0) {
    return `⏳ "${dueSoon[0].title}" is due soon. Consider working on it.`
  }

  return `📋 You have ${incomplete.length} incomplete tasks. Try picking one and making progress.`
}

function generateResponse(tasks: Task[], message: string): string {
  const q = message.toLowerCase()

  if (q.includes('overdue') || q.includes('late') || q.includes('behind')) {
    const overdue = tasks.filter(
      (t) => t.due_date! && new Date(t.due_date!) < new Date() && t.status !== 'completed'
    )
    if (overdue.length === 0) return 'No overdue tasks — you\'re all caught up!'
    let resp = `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}:\n`
    overdue.forEach((t) => {
      resp += `  • ${t.title} (due ${new Date(t.due_date!).toLocaleDateString()})\n`
    })
    return resp.trim()
  }

  if (q.includes('high') || q.includes('urgent') || q.includes('priority')) {
    const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed')
    if (high.length === 0) return 'No high-priority tasks pending. Nice!'
    let resp = `🔴 High-priority task${high.length > 1 ? 's' : ''}:\n`
    high.forEach((t) => {
      resp += `  • ${t.title} — ${t.status.replace('_', ' ')}\n`
    })
    return resp.trim()
  }

  if (q.includes('due') || q.includes('deadline') || q.includes('coming')) {
    const upcoming = tasks.filter((t) => {
      if (!t.due_date! || t.status === 'completed') return false
      return new Date(t.due_date!) >= new Date()
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    if (upcoming.length === 0) return 'No upcoming deadlines. Enjoy the calm!'
    let resp = `📅 Upcoming deadlines:\n`
    upcoming.slice(0, 5).forEach((t) => {
      resp += `  • ${t.title} — ${new Date(t.due_date!).toLocaleDateString()}\n`
    })
    return resp.trim()
  }

  if (q.includes('completed') || q.includes('done') || q.includes('finished')) {
    const completed = tasks.filter((t) => t.status === 'completed')
    return `✅ You've completed ${completed.length} task${completed.length !== 1 ? 's' : ''}. ${completed.length > 0 ? 'Great work!' : 'Time to start on something!'}`
  }

  if (q.includes('progress') || q.includes('status') || q.includes('how am i')) {
    return analyzeTasks(tasks)
  }

  if (q.includes('suggest') || q.includes('what should') || q.includes('recommend') || q.includes('next')) {
    return generateSuggestion(tasks)
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    const analysis = analyzeTasks(tasks)
    return `Hello! 👋 I'm your AI task assistant.\n\n${analysis}\n\nAsk me about overdue tasks, priorities, deadlines, or for suggestions on what to work on next.`
  }

  if (q.includes('help') || q.includes('what can you')) {
    return `I can help you with:\n  • 📊 Task overview and progress\n  • ⏰ Upcoming deadlines\n  • 🔴 High-priority items\n  • ⚠️ Overdue tasks\n  • 💡 Suggestions on what to work on\n\nJust ask me anything about your tasks!`
  }

  const analysis = analyzeTasks(tasks)
  return `Here's your current overview:\n${analysis}\n\nYou can ask me about specific things like "what's overdue?" or "what should I work on next?"`
}

let context: { tasks: Task[]; messages: ChatMessage[] } = { tasks: [], messages: [] }

export function setTaskContext(tasks: Task[]) {
  context.tasks = tasks
}

export function getChatResponse(userMessage: string): ChatMessage {
  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
  }
  context.messages.push(userMsg)

  const content = generateResponse(context.tasks, userMessage)
  const assistantMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
  }
  context.messages.push(assistantMsg)

  return assistantMsg
}

export function getInitialGreeting(): ChatMessage {
  const content = context.tasks.length === 0
    ? 'Welcome! 👋 I\'m your AI task assistant. Create some tasks and I\'ll help you stay on top of them.'
    : `Hi there! 👋 I'm your AI assistant.\n\n${analyzeTasks(context.tasks)}\n\nAsk me about your tasks anytime!`

  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
    timestamp: new Date(),
  }
}

export function clearChatContext() {
  context.messages = []
}
