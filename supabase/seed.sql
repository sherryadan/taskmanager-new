-- Sample Data Script
-- Run after setting up the schema and creating a test user

-- Replace 'your-test-user-uuid' with an actual user ID from auth.users
-- You can get this from: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  IF user_id IS NULL THEN
    RAISE NOTICE 'No users found. Create a user first via the signup page.';
    RETURN;
  END IF;

  -- Insert sample tasks
  INSERT INTO tasks (owner_id, title, description, priority, status, due_date) VALUES
    (user_id, 'Design landing page mockup', 'Create wireframes and high-fidelity mockups for the new landing page', 'high', 'in_progress', CURRENT_DATE + INTERVAL '3 days'),
    (user_id, 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'high', 'pending', CURRENT_DATE + INTERVAL '7 days'),
    (user_id, 'Write API documentation', 'Document all REST API endpoints with request/response examples', 'medium', 'pending', CURRENT_DATE + INTERVAL '14 days'),
    (user_id, 'Refactor authentication module', 'Migrate from JWT to session-based auth with refresh tokens', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '5 days'),
    (user_id, 'Fix responsive layout issues', 'Address mobile rendering bugs on the dashboard page', 'low', 'completed', CURRENT_DATE - INTERVAL '1 day'),
    (user_id, 'Implement dark mode toggle', 'Add theme switcher with system preference detection', 'low', 'completed', CURRENT_DATE - INTERVAL '2 days'),
    (user_id, 'Optimize database queries', 'Add indexes and optimize slow queries in the tasks service', 'high', 'pending', CURRENT_DATE + INTERVAL '10 days'),
    (user_id, 'Add unit tests for task service', 'Achieve 80% code coverage on task CRUD operations', 'medium', 'pending', CURRENT_DATE + INTERVAL '21 days'),
    (user_id, 'Prepare Q2 presentation', 'Compile metrics and achievements for quarterly review', 'medium', 'in_progress', CURRENT_DATE + INTERVAL '4 days'),
    (user_id, 'Review pull requests', 'Review open PRs from the team before the release', 'high', 'pending', CURRENT_DATE + INTERVAL '1 day');

  RAISE NOTICE 'Inserted 10 sample tasks for user %', user_id;
END $$;
