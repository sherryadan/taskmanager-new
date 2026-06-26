import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Mail, Calendar, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useTasks } from '../hooks/useTasks'
import { getProfile, updateProfile } from '../services/auth'

export function Profile() {
  const { user } = useAuth()
  const { stats } = useTasks()
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then((profile) => {
      if (profile?.full_name) {
        setFullName(profile.full_name)
      } else if (user.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name)
      }
    })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile({ id: user.id, full_name: fullName })
      toast.success('Name updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statItems: { label: string; value: string | number }[] = [
    { label: 'Total Tasks', value: stats.total },
    { label: 'Completed', value: stats.completed },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'Pending', value: stats.pending },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account</p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {fullName || 'User'}
              </h2>
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <Mail size={14} />
                {user.email}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Account Details
          </h3>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar size={16} />
              Member since {memberSince}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Shield size={16} />
              Account ID: {user.id.slice(0, 8)}...
            </div>
            <Button variant="secondary" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Task Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50"
              >
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
