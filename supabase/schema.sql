-- AI Smart Task Manager - Database Schema
-- Run this in your Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE)

-- Remove old trigger (if any) that was causing signup 500 errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 0. Profiles table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 1. Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Task shares table
CREATE TABLE IF NOT EXISTS task_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  shared_with UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(task_id, shared_with)
);

-- 3. Activity log table
CREATE TABLE IF NOT EXISTS task_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Helper function to check shared access (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION is_task_shared_with_user(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM task_shares
    WHERE task_id = p_task_id AND shared_with = auth.uid()
  );
$$;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_shares_task_id ON task_shares(task_id);
CREATE INDEX IF NOT EXISTS idx_task_shares_shared_with ON task_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_user_id ON task_activity(user_id);

-- 6. Enable Row Level Security
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_activity ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for profiles (drop & recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view profiles by email" ON profiles;
CREATE POLICY "Anyone can view profiles by email"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 8. RLS Policies for tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view shared tasks" ON tasks;
CREATE POLICY "Users can view shared tasks"
  ON tasks FOR SELECT
  USING (is_task_shared_with_user(id));

DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
CREATE POLICY "Users can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Shared users can update task status" ON tasks;
CREATE POLICY "Shared users can update task status"
  ON tasks FOR UPDATE
  USING (is_task_shared_with_user(id));

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (owner_id = auth.uid());

-- 9. RLS Policies for task_shares
DROP POLICY IF EXISTS "Users can view task shares" ON task_shares;
CREATE POLICY "Users can view task shares"
  ON task_shares FOR SELECT
  USING (
    shared_with = auth.uid() OR
    shared_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can share own tasks" ON task_shares;
CREATE POLICY "Users can share own tasks"
  ON task_shares FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own task shares" ON task_shares;
CREATE POLICY "Users can delete own task shares"
  ON task_shares FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND owner_id = auth.uid())
  );

-- 10. RLS Policies for task_activity
DROP POLICY IF EXISTS "Users can view task activity" ON task_activity;
CREATE POLICY "Users can view task activity"
  ON task_activity FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND owner_id = auth.uid()) OR
    is_task_shared_with_user(task_id)
  );

DROP POLICY IF EXISTS "Users can create activity" ON task_activity;
CREATE POLICY "Users can create activity"
  ON task_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 11. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
