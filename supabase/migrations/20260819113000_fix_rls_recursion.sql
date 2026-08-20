-- Fix infinite recursion in RLS policies.
-- Policies that read the User table inside a User-table policy recurse (42P17).
-- Use a SECURITY DEFINER helper so role lookups bypass RLS.

create or replace function public.app_role()
returns public."Role"
language sql
security definer
set search_path = public
stable
as $$
  select role from public."User" where id = auth.uid()
$$;

grant execute on function public.app_role() to authenticated, anon;

-- --- User ---
drop policy if exists "Users read own profile" on public."User";
create policy "Users read own profile" on public."User"
  for select using (auth.uid() = id or public.app_role() in ('teacher', 'admin'));

-- --- Certificate ---
drop policy if exists "Certificates read own" on public."Certificate";
create policy "Certificates read own" on public."Certificate"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));

-- --- LessonProgress ---
drop policy if exists "Progress read own" on public."LessonProgress";
create policy "Progress read own" on public."LessonProgress"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));

-- --- QuizAttempt ---
drop policy if exists "QuizAttempts read own" on public."QuizAttempt";
create policy "QuizAttempts read own" on public."QuizAttempt"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));

-- --- AssignmentSubmission ---
drop policy if exists "Submissions read own" on public."AssignmentSubmission";
create policy "Submissions read own" on public."AssignmentSubmission"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));

drop policy if exists "Submissions teacher update" on public."AssignmentSubmission";
create policy "Submissions teacher update" on public."AssignmentSubmission"
  for update using (public.app_role() in ('teacher', 'admin'));