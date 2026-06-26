import type { Task, ChatMessage } from '../types'

function findTask(tasks: Task[], query: string): Task | null {
  const words = query.toLowerCase().split(/\s+/)
  let best: Task | null = null
  let bestScore = 0
  for (const t of tasks) {
    const title = t.title.toLowerCase()
    let score = 0
    for (const w of words) {
      if (w.length > 2 && title.includes(w)) score++
    }
    if (score > bestScore) {
      bestScore = score
      best = t
    }
  }
  return bestScore > 0 ? best : null
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime()
  return Math.ceil(diff / 86400000)
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

function analyzeTasks(tasks: Task[]): string {
  const total = tasks.length
  if (total === 0) return "You haven't created any tasks yet."

  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending').length
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length
  const dueSoon = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false
    return daysUntil(t.due_date) <= 3
  }).length

  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const parts: string[] = []
  parts.push(`You have **${total}** tasks total — ${completed} done, ${inProgress} in progress, ${pending} pending.`)
  parts.push(`Completion rate: **${rate}%**.`)

  if (overdue > 0) parts.push(`⚠️ **${overdue}** overdue — these should be your top priority.`)
  if (highPriority > 0) parts.push(`🔴 **${highPriority}** high-priority tasks still open.`)
  if (dueSoon > 0) parts.push(`⏰ **${dueSoon}** tasks due in the next 3 days.`)

  if (rate >= 75) parts.push('🌟 You\'re crushing it!')
  else if (rate >= 50) parts.push('👍 Solid progress! Keep pushing.')
  else if (rate >= 25) parts.push('📈 You\'re getting there — stay consistent.')
  else if (total > 0) parts.push('💪 You\'ve got this — pick one task and start.')

  return parts.join('\n')
}

function recommendTask(tasks: Task[], task: Task): string {
  const now = new Date()
  const isOverdue = task.due_date && new Date(task.due_date) < now
  const isDueSoon = task.due_date && daysUntil(task.due_date) <= 3 && daysUntil(task.due_date) >= 0
  const isHigh = task.priority === 'high'
  const isMedium = task.priority === 'medium'

  const higherPriorityCount = tasks.filter(
    (t) => t.id !== task.id && t.priority === 'high' && t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
  ).length

  let reasoning: string[] = []
  let verdict: string

  if (isOverdue && isHigh) {
    reasoning.push('This task is **overdue** and **high-priority**')
    reasoning.push('Failing to complete it soon could have significant consequences')
    verdict = '**Yes, you should absolutely complete this task right now.** It\'s the most urgent item on your list.'
  } else if (isOverdue) {
    reasoning.push('This task is **overdue**')
    if (higherPriorityCount > 0) {
      reasoning.push(`However, you have **${higherPriorityCount}** other overdue high-priority tasks that may be more critical`)
      verdict = '**Prioritize this**, but check if there are higher-stakes overdue tasks first.'
    } else {
      verdict = '**Yes, complete this soon.** It\'s past due and there\'s no reason to delay further.'
    }
  } else if (isDueSoon && isHigh) {
    reasoning.push('This task is **due within 3 days** and **high-priority**')
    verdict = '**Yes, work on this now.** The deadline is approaching and it matters.'
  } else if (isDueSoon) {
    reasoning.push('This task is **due within 3 days**')
    if (higherPriorityCount > 0) {
      reasoning.push(`But you have ${higherPriorityCount} overdue high-priority tasks — those should come first`)
      verdict = '**Yes, but only after clearing overdue items.**'
    } else {
      verdict = '**Yes, get it done.** The deadline is close enough to warrant focus.'
    }
  } else if (isHigh) {
    reasoning.push('This is **high-priority**')
    if (task.status === 'in_progress') {
      reasoning.push('You\'ve already started it — momentum is on your side')
      verdict = '**Yes, keep going.** You\'re already making progress on something important.'
    } else {
      const dueInfo = task.due_date ? `Due in ${daysUntil(task.due_date)} days. ` : ''
      reasoning.push(`${dueInfo}You have time, but it should stay on your radar`)
      verdict = '**Yes, consider starting it soon.** It\'s important even if the deadline isn\'t pressing.'
    }
  } else if (task.status === 'in_progress') {
    reasoning.push('You\'re already working on it')
    const higherPriority = tasks.filter((t) => t.id !== task.id && t.priority === 'high' && t.status !== 'completed' && t.due_date && new Date(t.due_date) < now)
    if (higherPriority.length > 0) {
      reasoning.push(`But there are ${higherPriority.length} overdue high-priority tasks that may need attention first`)
      verdict = '**Only if no urgent tasks are waiting.** Otherwise, switch to those first.'
    } else {
      verdict = '**Yes, finish what you started.** Momentum is valuable.'
    }
  } else {
    reasoning.push('This task has no urgent deadlines or high-priority flags')
    const betterOptions = tasks.filter(
      (t) => t.id !== task.id && t.status !== 'completed' && (t.priority === 'high' || (t.due_date && daysUntil(t.due_date) <= 3))
    )
    if (betterOptions.length > 0) {
      reasoning.push(`You have **${betterOptions.length}** more urgent task${betterOptions.length > 1 ? 's' : ''} to handle first`)
      verdict = '**Not right now.** Focus on higher-priority or time-sensitive tasks first.'
    } else {
      verdict = '**Sure, go for it.** No urgent tasks are competing for your attention.'
    }
  }

  return `### ${task.title}\n\n${reasoning.map((r) => `• ${r}`).join('\n')}\n\n**Recommendation:** ${verdict}`
}

function shouldCompleteQuery(tasks: Task[], q: string): string | null {
  const patterns = [
    /should\s+i\s+(complete|do|finish|work\s+on)\s+["""]?(.+?)["""]?\s*\??/i,
    /should\s+i\s+(complete|do|finish|work\s+on)\s+["""]?(.+?)$/i,
    /is\s+["""]?(.+?)["""]?\s+(worth|important|urgent)/i,
    /what\s+about\s+["""]?(.+?)["""]?\s*\??/i,
    /how\s+about\s+["""]?(.+?)["""]?\s*\??/i,
    /tell\s+me\s+about\s+["""]?(.+?)["""]?\s*\??/i,
  ]

  let taskName = ''
  for (const p of patterns) {
    const m = q.match(p)
    if (m) {
      taskName = m[m.length - 1].trim()
      break
    }
  }

  if (!taskName) return null

  const task = findTask(tasks, taskName)
  if (!task) {
    return `I couldn't find a task matching "${taskName}". Try being more specific or check the task name.`
  }

  return recommendTask(tasks, task)
}

function generateResponse(tasks: Task[], message: string): string {
  const q = message.toLowerCase().trim()

  const shouldMatch = shouldCompleteQuery(tasks, message)
  if (shouldMatch) return shouldMatch

  if (q.includes('overdue') || q.includes('late') || q.includes('behind')) {
    const overdue = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    )
    if (overdue.length === 0) return 'No overdue tasks — you\'re all caught up! 🎉'

    const high = overdue.filter((t) => t.priority === 'high')
    const rest = overdue.filter((t) => t.priority !== 'high')

    let resp = `You have **${overdue.length}** overdue task${overdue.length > 1 ? 's' : ''}:\n\n`
    if (high.length > 0) {
      resp += `🔴 **Critical — high priority:**\n`
      high.forEach((t) => {
        resp += `  • ${t.title} (due ${fmtDate(t.due_date!)})\n`
      })
      resp += '\n'
    }
    if (rest.length > 0) {
      resp += `📋 **Other overdue:**\n`
      rest.slice(0, 3).forEach((t) => {
        resp += `  • ${t.title} (due ${fmtDate(t.due_date!)})\n`
      })
      if (rest.length > 3) resp += `  • ...and ${rest.length - 3} more\n`
    }
    resp += `\n💡 **Tip:** Start with the high-priority ones first. They matter most.`
    return resp
  }

  if (q.includes('high') || q.includes('urgent') || q.includes('priority')) {
    const high = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed')
    if (high.length === 0) return 'No high-priority tasks pending. Nice! 🎉'

    const overdue = high.filter((t) => t.due_date && new Date(t.due_date) < new Date())
    const safe = high.filter((t) => !overdue.includes(t))

    let resp = `🔴 You have **${high.length}** high-priority task${high.length > 1 ? 's' : ''} pending:\n\n`
    if (overdue.length > 0) {
      resp += `⚠️ **Overdue — act now:**\n`
      overdue.forEach((t) => {
        const due = t.due_date ? `(was due ${new Date(t.due_date).toLocaleDateString()})` : ''
        resp += `  • ${t.title} ${due}\n`
      })
      resp += '\n'
    }
    if (safe.length > 0) {
      resp += `📋 **Upcoming:**\n`
      safe.slice(0, 3).forEach((t) => {
        const due = t.due_date ? `(due ${new Date(t.due_date).toLocaleDateString()})` : ''
        resp += `  • ${t.title} ${due}\n`
      })
    }
    resp += `\n💡 **Tip:** Knock out the overdue ones first, then tackle the rest.`
    return resp
  }

  if (q.includes('due') || q.includes('deadline') || q.includes('coming') || q.includes('upcoming')) {
    const upcoming = tasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false
      return new Date(t.due_date) >= new Date()
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())

    if (upcoming.length === 0) return 'No upcoming deadlines. Enjoy the calm! 😌'

    let resp = `📅 **Upcoming deadlines (${upcoming.length}):**\n\n`
    upcoming.slice(0, 5).forEach((t) => {
      const dd = t.due_date!
      const days = daysUntil(dd)
      const urgency = days <= 3 ? ' ⏰' : days <= 7 ? ' 📌' : ''
      resp += `  • ${t.title} — ${new Date(dd).toLocaleDateString()} (in ${days} day${days === 1 ? '' : 's'})${urgency}\n`
    })
    if (upcoming.length > 5) {
      resp += `  • ...and ${upcoming.length - 5} more\n`
    }

    const dueSoon = upcoming.filter((t) => daysUntil(t.due_date!) <= 3)
    if (dueSoon.length > 0) {
      resp += `\n⚠️ **${dueSoon.length}** task${dueSoon.length > 1 ? 's' : ''} due within 3 days — don't let them slip!`
    }
    return resp
  }

  if (q.includes('completed') || q.includes('done') || q.includes('finished') || q.includes('accomplish')) {
    const completed = tasks.filter((t) => t.status === 'completed')
    const rate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

    if (completed.length === 0) return 'You haven\'t completed any tasks yet. Time to change that! 💪'

    let resp = `✅ You've completed **${completed.length}** task${completed.length > 1 ? 's' : ''}`
    if (rate > 0) resp += ` (${rate}% of all tasks)`
    resp += '.\n\n'

    if (rate >= 75) resp += '🌟 Outstanding! You\'re making great progress.'
    else if (rate >= 50) resp += '👍 Good momentum! Keep it up.'
    else resp += '📈 Every completed task counts — keep going!'

    return resp
  }

  if (q.includes('progress') || q.includes('status') || q.includes('how am i') || q.includes('overview') || q.includes('summary')) {
    return analyzeTasks(tasks)
  }

  if (q.includes('suggest') || q.includes('what should') || q.includes('recommend') || q.includes('next') || q.includes('where')) {
    const incomplete = tasks.filter((t) => t.status !== 'completed')
    if (incomplete.length === 0) return 'All tasks completed! 🎉 Take a break or set new goals.'

    const overdue = incomplete.filter((t) => t.due_date && new Date(t.due_date) < new Date()).sort(
      (a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0)
    )
    if (overdue.length > 0) {
      const top = overdue[0]
      const reason = top.priority === 'high' ? 'It\'s both overdue and high-priority' : 'It\'s past its deadline'
      return `📍 **Start here:** "${top.title}"\n\n${reason}. This should be your first focus.\n\nWant me to break down why? Just say "should I complete ${top.title}?".`
    }

    const high = incomplete.filter((t) => t.priority === 'high')
    if (high.length > 0) {
      const top = high[0]
      const dueInfo = top.due_date ? ` It's due ${fmtDate(top.due_date!)}.` : ''
      return `🎯 **Focus on:** "${top.title}"\n\nThis is your highest-priority task.${dueInfo}\n\nAsk me "should I complete ${top.title}?" for a detailed breakdown.`
    }

    const dueSoon = incomplete.filter((t) => t.due_date && daysUntil(t.due_date!) <= 3 && daysUntil(t.due_date!) >= 0)
    if (dueSoon.length > 0) {
      const top = dueSoon[0]
      const dd = top.due_date!
      return `⏰ **Time-sensitive:** "${top.title}"\n\nDue in ${daysUntil(dd)} day${daysUntil(dd) === 1 ? '' : 's'}. Don't let it sneak up on you!`
    }

    const inProgress = incomplete.filter((t) => t.status === 'in_progress')
    if (inProgress.length > 0) {
      return `🔄 **Keep going with:** "${inProgress[0].title}"\n\nYou've already started — finishing what you began builds momentum.`
    }

    return `📋 You have **${incomplete.length}** tasks waiting. Pick any one and take the first step! 🚀`
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('yo')) {
    const hours = new Date().getHours()
    const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening'

    if (tasks.length === 0) {
      return `${greeting}! 👋 I'm your AI task assistant.\n\nYou don't have any tasks yet. Create a few and I'll help you stay organized and productive!`
    }

    const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed')
    const todayDue = tasks.filter((t) => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString() && t.status !== 'completed')

    let status = ''
    if (overdue.length > 0) status = `\n\n⚠️ Heads up — you have **${overdue.length}** overdue task${overdue.length > 1 ? 's' : ''} that needs attention.`
    else if (todayDue.length > 0) status = `\n\n📌 You have **${todayDue.length}** task${todayDue.length > 1 ? 's' : ''} due today.`
    else status = `\n\n✅ No urgent deadlines right now.`

    return `${greeting}! 👋 I'm your AI assistant.\n\nYou have **${tasks.length}** task${tasks.length > 1 ? 's' : ''} in your list.${status}\n\nTry asking:\n• "What should I work on?"\n• "Should I complete [task name]?"\n• "What's overdue?"\n• "Give me a summary"`
  }

  if (q.includes('help') || q.includes('what can you') || q.includes('capabilities') || q.includes('commands')) {
    return `I can help you manage your tasks! Here's what I understand:\n\n` +
      `💬 **"Should I complete [task name]?"** — I'll analyze the task and tell you if it's worth doing now\n` +
      `📊 **"Give me a summary"** — Full overview of your progress\n` +
      `⚠️ **"What's overdue?"** — List of past-due tasks\n` +
      `🔴 **"High priority tasks"** — What needs urgent attention\n` +
      `📅 **"Upcoming deadlines"** — What's due soon\n` +
      `💡 **"What should I work on?"** — Personalized recommendation\n` +
      `✅ **"What have I completed?"** — Your accomplishments\n\n` +
      `I give you **reasoned recommendations**, not just facts. Try asking about a specific task!`
  }

  if (q.includes('thank') || q.includes('thanks')) {
    return 'You\'re welcome! 😊 Let me know if you need help with anything else.'
  }

  if (q.includes('bye') || q.includes('goodbye')) {
    return 'Take care! 👋 I\'ll be here whenever you need me. Keep crushing those tasks!'
  }

  const fallback = analyzeTasks(tasks)
  return `Here's your current overview:\n\n${fallback}\n\nIf you want advice on a specific task, just ask "should I complete [task name]?"`
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
  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening'

  const content = context.tasks.length === 0
    ? `${greeting}! 👋 I'm your AI task assistant. Create some tasks and I'll help you stay on top of them with personalized advice!\n\nTry asking "what can you do?" to see my capabilities.`
    : `${greeting}! 👋 I'm your AI task assistant.\n\nI've analyzed your **${context.tasks.length}** task${context.tasks.length > 1 ? 's' : ''}. You can ask me:\n\n` +
      `• **"Should I complete [task name]?"** — I'll give you a reasoned recommendation\n` +
      `• **"What should I work on?"** — Smart suggestion based on priority & deadlines\n` +
      `• **"What's overdue?"** — See what's falling behind\n` +
      `• **"Give me a summary"** — Full progress overview`

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
