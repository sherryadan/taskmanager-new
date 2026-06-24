# TaskFlow - AI Smart Task Manager

A modern full-stack task management application built with React, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Authentication**: Sign up, login, forgot password, session persistence via Supabase Auth
- **Dashboard**: Statistics cards, task completion progress bar, AI-powered insights, recent activity
- **Task CRUD**: Create, read, update, delete tasks with title, description, priority, status, due date
- **Task Views**: List and grid view, search, filter by status/priority, sort by multiple fields
- **Task Sharing**: Share tasks with other users by email, revoke access, view shared tasks
- **Real-time Updates**: Live task updates via Supabase subscriptions
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Responsive Design**: Works on mobile, tablet, and desktop
- **AI Features**: AI-generated task summaries, priority suggestions, deadline risk prediction, productivity insights

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 + TypeScript | Frontend framework |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Styling |
| Supabase | Backend, Database, Auth |
| Zustand | State management |
| React Router v7 | Routing |
| Lucide React | Icons |
| React Hot Toast | Notifications |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)

### 1. Clone and install

```bash
git clone <repo-url>
cd task-manager
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `supabase/schema.sql` and run it
4. (Optional) Run `supabase/seed.sql` for sample data after creating a user

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> You can find these in your Supabase project under **Settings > API**.

### 4. Enable Auth methods

In your Supabase dashboard:
- Go to **Authentication > Providers**
- Ensure **Email** auth is enabled
- (Optional) Disable "Confirm email" for easier testing during development

### 5. Run the app

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── dashboard/     # StatCard, ProgressBar, RecentActivity
│   ├── layout/        # AppLayout, Sidebar
│   ├── share/         # ShareModal, SharedUsersList
│   ├── tasks/         # TaskCard, TaskForm, TaskFilters, DeleteConfirmModal
│   └── ui/            # Button, Card, Input, Modal, Select, Badge, Skeleton
├── contexts/          # AuthContext
├── hooks/             # useTasks, useRealtime
├── pages/             # Dashboard, Tasks, Shared, Profile, Login, Signup, ForgotPassword, NotFound
├── services/          # supabase client, auth, tasks, shares
├── store/             # Zustand store
├── types/             # TypeScript interfaces
└── utils/             # helpers, constants
supabase/
├── schema.sql         # Database schema and RLS policies
└── seed.sql           # Sample data
```

## Database Schema

### Tables

- **tasks** - Task records with owner_id, title, description, priority, status, due_date
- **task_shares** - Many-to-many task sharing between users
- **task_activity** - Activity log for tasks

### Row Level Security (RLS)

- Users can only access their own tasks
- Shared users can view and update status of shared tasks
- Task owners can manage sharing

## API Endpoints (via Supabase)

### Auth
- `signUp(email, password)` - Create account
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `resetPassword(email)` - Forgot password

### Tasks
- `getTasks(ownerId)` - Fetch all accessible tasks
- `createTask(data)` - Create a task
- `updateTask(id, updates)` - Update a task
- `deleteTask(id)` - Delete a task

### Sharing
- `shareTask(taskId, sharedWith, sharedBy)` - Share a task
- `revokeShare(shareId)` - Remove sharing
- `findUserByEmail(email)` - Find user to share with

## Deployment

### Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the framework to **Vite**
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify

1. Push to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in **Site settings > Environment variables**

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Keyboard Shortcuts

- `Ctrl+K` - Search tasks (coming soon)

## License

MIT
