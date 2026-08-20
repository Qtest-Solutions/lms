-- LMS Schema for Supabase
-- Ported from backend/prisma/schema.prisma
-- Apply via: supabase db push / psql -f supabase/schema.sql

-- ============ ENUMS ============

create type public."Role" as enum ('student', 'teacher', 'admin');
create type public."SessionType" as enum ('one-to-one', 'batch');
create type public."SessionStatus" as enum ('scheduled', 'active', 'completed', 'cancelled');
create type public."SubmissionStatus" as enum ('submitted', 'verified', 'returned');

-- ============ TABLES ============

create table public."User" (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  name text not null,
  role public."Role" not null default 'student',
  "assignedTeacherId" uuid,
  "createdAt" timestamptz not null default now(),
  constraint fk_assigned_teacher foreign key ("assignedTeacherId") references public."User"(id) on delete set null
);

create index "User_assignedTeacherId_idx" on public."User"("assignedTeacherId");

create table public."Course" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null unique,
  description text not null default '',
  "createdAt" timestamptz not null default now()
);

create table public."Section" (
  id uuid primary key default gen_random_uuid(),
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  title text not null
);
create index "Section_courseId_idx" on public."Section"("courseId");

create table public."Lesson" (
  id uuid primary key default gen_random_uuid(),
  "sectionId" uuid not null references public."Section"(id) on delete cascade,
  title text not null,
  type text not null,
  content text not null
);
create index "Lesson_sectionId_idx" on public."Lesson"("sectionId");

create table public."Batch" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "teacherId" uuid not null references public."User"(id),
  "courseId" uuid not null references public."Course"(id) on delete cascade
);
create index "Batch_teacherId_idx" on public."Batch"("teacherId");
create index "Batch_courseId_idx" on public."Batch"("courseId");

create table public."LiveSession" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  "teacherId" uuid not null references public."User"(id),
  "batchId" uuid references public."Batch"(id) on delete set null,
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  "scheduledAt" timestamptz not null,
  duration int not null,
  type public."SessionType" not null default 'one-to-one',
  status public."SessionStatus" not null default 'scheduled'
);
create index "LiveSession_teacherId_idx" on public."LiveSession"("teacherId");
create index "LiveSession_batchId_idx" on public."LiveSession"("batchId");
create index "LiveSession_courseId_idx" on public."LiveSession"("courseId");

create table public."Recording" (
  id uuid primary key default gen_random_uuid(),
  "sessionId" uuid not null unique references public."LiveSession"(id) on delete cascade,
  title text not null,
  url text not null,
  duration int not null,
  "createdAt" timestamptz not null default now()
);

create table public."CertificateTemplate" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  width float not null default 841.89,
  height float not null default 595.28,
  background text not null default '#FFFFFF',
  "backgroundImage" text,
  "borderStyle" text not null default 'solid',
  "borderWidth" float not null default 3,
  "borderColor" text not null default '#000000',
  elements jsonb not null default '[]',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."Certificate" (
  id uuid primary key default gen_random_uuid(),
  "studentId" uuid not null references public."User"(id),
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  "templateId" uuid references public."CertificateTemplate"(id) on delete set null,
  "issuedAt" timestamptz not null default now(),
  "publicId" text not null unique
);
create index "Certificate_studentId_idx" on public."Certificate"("studentId");
create index "Certificate_courseId_idx" on public."Certificate"("courseId");

create table public."LessonProgress" (
  id uuid primary key default gen_random_uuid(),
  "studentId" uuid not null references public."User"(id) on delete cascade,
  "lessonId" uuid not null references public."Lesson"(id) on delete cascade,
  "completedAt" timestamptz not null default now(),
  unique ("studentId", "lessonId")
);

create table public."Question" (
  id uuid primary key default gen_random_uuid(),
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  question text not null,
  options text not null,
  "correctIndex" int not null,
  explanation text not null default '',
  "createdBy" uuid references public."User"(id),
  "createdAt" timestamptz not null default now()
);
create index "Question_courseId_idx" on public."Question"("courseId");

create table public."QuizAttempt" (
  id uuid primary key default gen_random_uuid(),
  "studentId" uuid not null references public."User"(id) on delete cascade,
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  score int not null,
  total int not null,
  answers text not null default '[]',
  "createdAt" timestamptz not null default now()
);
create index "QuizAttempt_studentId_idx" on public."QuizAttempt"("studentId");
create index "QuizAttempt_courseId_idx" on public."QuizAttempt"("courseId");

create table public."Assignment" (
  id uuid primary key default gen_random_uuid(),
  "courseId" uuid not null references public."Course"(id) on delete cascade,
  title text not null,
  description text not null,
  points int not null default 10,
  "dueAt" timestamptz,
  "createdBy" uuid not null references public."User"(id),
  "createdAt" timestamptz not null default now()
);
create index "Assignment_courseId_idx" on public."Assignment"("courseId");

create table public."AssignmentSubmission" (
  id uuid primary key default gen_random_uuid(),
  "assignmentId" uuid not null references public."Assignment"(id) on delete cascade,
  "studentId" uuid not null references public."User"(id) on delete cascade,
  content text not null,
  status public."SubmissionStatus" not null default 'submitted',
  score int,
  feedback text,
  "submittedAt" timestamptz not null default now(),
  "verifiedBy" uuid references public."User"(id),
  "verifiedAt" timestamptz,
  unique ("assignmentId", "studentId")
);
create index "AssignmentSubmission_studentId_idx" on public."AssignmentSubmission"("studentId");

-- ============ MANY-TO-MANY JOIN TABLES (Prisma implicit relations) ============

create table public."_BatchToUser" (
  "A" uuid not null references public."Batch"(id) on delete cascade on update cascade,
  "B" uuid not null references public."User"(id) on delete cascade on update cascade,
  primary key ("A", "B")
);
create index "_BatchToUser_B_index" on public."_BatchToUser"("B");

create table public."_LiveSessionToUser" (
  "A" uuid not null references public."LiveSession"(id) on delete cascade on update cascade,
  "B" uuid not null references public."User"(id) on delete cascade on update cascade,
  primary key ("A", "B")
);
create index "_LiveSessionToUser_B_index" on public."_LiveSessionToUser"("B");

create table public."_RecordingToUser" (
  "A" uuid not null references public."Recording"(id) on delete cascade on update cascade,
  "B" uuid not null references public."User"(id) on delete cascade on update cascade,
  primary key ("A", "B")
);
create index "_RecordingToUser_B_index" on public."_RecordingToUser"("B");

-- Role lookup helper (SECURITY DEFINER) so policies never recurse on the User table.
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

-- ============ RLS ============

alter table public."User" enable row level security;
alter table public."Course" enable row level security;
alter table public."Section" enable row level security;
alter table public."Lesson" enable row level security;
alter table public."Batch" enable row level security;
alter table public."LiveSession" enable row level security;
alter table public."Recording" enable row level security;
alter table public."CertificateTemplate" enable row level security;
alter table public."Certificate" enable row level security;
alter table public."LessonProgress" enable row level security;
alter table public."Question" enable row level security;
alter table public."QuizAttempt" enable row level security;
alter table public."Assignment" enable row level security;
alter table public."AssignmentSubmission" enable row level security;
alter table public."_BatchToUser" enable row level security;
alter table public."_LiveSessionToUser" enable row level security;
alter table public."_RecordingToUser" enable row level security;

-- Service role bypasses RLS automatically. Authenticated users use these policies.
-- Auth runs through the Next.js API routes (JWT in a cookie); the anon key is
-- not exposed to the browser. Policies below are set up for the final state
-- where the frontend talks to Supabase directly.

create policy "Users read own profile" on public."User"
  for select using (auth.uid() = id or public.app_role() in ('teacher', 'admin'));

create policy "Users update self" on public."User"
  for update using (auth.uid() = id);

create policy "Courses read all" on public."Course"
  for select using (true);
create policy "Courses admin write" on public."Course"
  for insert with check (true);
create policy "Courses admin update" on public."Course"
  for update using (true);
create policy "Courses admin delete" on public."Course"
  for delete using (true);

create policy "Sections read all" on public."Section"
  for select using (true);
create policy "Sections admin write" on public."Section"
  for insert with check (true);
create policy "Sections admin update" on public."Section"
  for update using (true);
create policy "Sections admin delete" on public."Section"
  for delete using (true);

create policy "Lessons read all" on public."Lesson"
  for select using (true);
create policy "Lessons admin write" on public."Lesson"
  for insert with check (true);
create policy "Lessons admin update" on public."Lesson"
  for update using (true);
create policy "Lessons admin delete" on public."Lesson"
  for delete using (true);

create policy "Batches read all" on public."Batch"
  for select using (true);
create policy "Batches write" on public."Batch"
  for insert with check (true);
create policy "Batches update" on public."Batch"
  for update using (true);
create policy "Batches delete" on public."Batch"
  for delete using (true);

create policy "Sessions read all" on public."LiveSession"
  for select using (true);
create policy "Sessions write" on public."LiveSession"
  for insert with check (true);
create policy "Sessions update" on public."LiveSession"
  for update using (true);
create policy "Sessions delete" on public."LiveSession"
  for delete using (true);

create policy "Recordings read all" on public."Recording"
  for select using (true);
create policy "Recordings write" on public."Recording"
  for insert with check (true);
create policy "Recordings update" on public."Recording"
  for update using (true);
create policy "Recordings delete" on public."Recording"
  for delete using (true);

create policy "Templates read all" on public."CertificateTemplate"
  for select using (true);
create policy "Templates write" on public."CertificateTemplate"
  for insert with check (true);
create policy "Templates update" on public."CertificateTemplate"
  for update using (true);
create policy "Templates delete" on public."CertificateTemplate"
  for delete using (true);

create policy "Certificates read own" on public."Certificate"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));
create policy "Certificates admin issue" on public."Certificate"
  for insert with check (true);

create policy "Progress read own" on public."LessonProgress"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));
create policy "Progress insert own" on public."LessonProgress"
  for insert with check (auth.uid() = "studentId");
create policy "Progress delete own" on public."LessonProgress"
  for delete using (auth.uid() = "studentId");

create policy "Questions read all" on public."Question"
  for select using (true);
create policy "Questions write" on public."Question"
  for insert with check (true);
create policy "Questions update" on public."Question"
  for update using (true);
create policy "Questions delete" on public."Question"
  for delete using (true);

create policy "QuizAttempts read own" on public."QuizAttempt"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));
create policy "QuizAttempts insert own" on public."QuizAttempt"
  for insert with check (auth.uid() = "studentId");

create policy "Assignments read all" on public."Assignment"
  for select using (true);
create policy "Assignments write" on public."Assignment"
  for insert with check (true);
create policy "Assignments update" on public."Assignment"
  for update using (true);
create policy "Assignments delete" on public."Assignment"
  for delete using (true);

create policy "Submissions read own" on public."AssignmentSubmission"
  for select using (auth.uid() = "studentId" or public.app_role() in ('teacher', 'admin'));
create policy "Submissions insert own" on public."AssignmentSubmission"
  for insert with check (auth.uid() = "studentId");
create policy "Submissions teacher update" on public."AssignmentSubmission"
  for update using (public.app_role() in ('teacher', 'admin'));

create policy "BatchStudents read all" on public."_BatchToUser"
  for select using (true);
create policy "BatchStudents write" on public."_BatchToUser"
  for insert with check (true);
create policy "BatchStudents delete" on public."_BatchToUser"
  for delete using (true);

create policy "SessionStudents read all" on public."_LiveSessionToUser"
  for select using (true);
create policy "SessionStudents write" on public."_LiveSessionToUser"
  for insert with check (true);
create policy "SessionStudents delete" on public."_LiveSessionToUser"
  for delete using (true);

create policy "RecordingStudents read all" on public."_RecordingToUser"
  for select using (true);
create policy "RecordingStudents write" on public."_RecordingToUser"
  for insert with check (true);
create policy "RecordingStudents delete" on public."_RecordingToUser"
  for delete using (true);