# LMS Specification

## 1. Project Overview

- **Name**: LMS (Learning Management System)
- **Purpose**: Online learning platform for course delivery, live classes, assignments, quizzes, and certificate generation
- **User Roles**: Student, Teacher, Admin
- **Demo Accounts** (password: `password`):
  - `admin@lms.test` — Admin
  - `teacher@lms.test` — Teacher
  - `student@lms.test` — Student

---

## 2. Admin Features

### 2.1 User Management
- **Students**: Create, edit (name/email), delete students
- **Teachers**: Create, edit, delete teachers; view batch count per teacher
- **Student-Teacher Assignment**: Assign/unassign a teacher to a student (1:1 relationship)
- Bulk view of assigned vs unassigned students

### 2.2 Course Management
- **Create courses** with title, code (unique), and description
- **Edit/delete** courses
- **Course content**: Organize by sections, each section contains lessons
- **Lesson types**: text, video (URL), image (upload to R2), assignment
- **Image uploads**: Direct upload to Cloudflare R2 storage
- **Quiz question pool**: Create/edit/delete questions per course (4 options, correct answer, explanation)

### 2.3 Batch Management
- **Create batches** with name, assigned teacher, and assigned course
- **Assign students** to batches (many-to-many)
- **Remove students** from batches
- View student count and names per batch

### 2.4 Live Session Management
- **View all sessions** across the platform
- **Status tracking**: SCHEDULED, ACTIVE, COMPLETED, CANCELLED

### 2.5 Certificate Management
- **Certificate templates**: Create, duplicate, delete templates
- **Canvas-based designer**: Drag-and-drop editor for certificate layout
- **Elements**: Text, lines, rectangles, images
- **Token placeholders**: `{student_name}`, `{student_email}`, `{course_name}`, `{course_code}`, `{date}`, `{year}`, `{certificate_id}`
- **Background**: Color or uploaded image
- **Preview mode**: Render with sample data
- **Issue certificates** to students manually

### 2.6 Dashboard
- Stats cards: total students, teachers, courses, live sessions
- Recent students list
- Recent live sessions

---

## 3. Teacher Features

### 3.1 Student Overview
- View assigned students (1:1)
- View class students (from batches)
- See student names and batch memberships

### 3.2 Batch Management
- View batches with student count and names
- See which students are in each batch

### 3.3 Live Classes
- **Schedule live classes**: Select batch (or 1:1), pick date/time
- **Start class**: Opens Jitsi video conference room
- **Reschedule**: Update date/time of scheduled classes
- **Cancel**: Cancel scheduled sessions
- **Class room**: Embedded Jitsi video call, auto-sets status to ACTIVE

### 3.4 Assignments
- **Create assignments**: Title, description, points, optional due date, linked to course
- **Edit/delete** assignments
- **Review submissions**: View student work, expandable details
- **Verify submissions**: Approve with score + feedback, or return for rework with feedback
- Track submission status: SUBMITTED, VERIFIED, RETURNED

### 3.5 Quiz Questions
- **Manage question pool** per course
- **Create/edit/delete questions**: Question text, 4 options, correct answer, explanation

---

## 4. Student Features

### 4.1 Course Browsing
- View all courses with lesson counts
- View course details: sections, lessons, quiz option, leaderboard, assignments

### 4.2 Learning
- **Lesson player**: Renders text content, video (iframe), image, or assignment type
- **Mark complete/incomplete**: Track progress per lesson
- **Navigation**: Previous/next lesson, course outline sidebar
- **Progress tracking**: Visual progress bar per course

### 4.3 Quizzes
- **Take quizzes**: 20 random questions from course pool
- **Auto-grading**: Instant score with explanations
- **Leaderboard**: Top 10 scores per course

### 4.4 Assignments
- **View assignments**: List with title, description, points, due date
- **Submit work**: Text content + optional file upload
- **Track status**: SUBMITTED, VERIFIED (with score/feedback), RETURNED (with feedback for rework)

### 4.5 Live Classes
- View upcoming and past live sessions
- Join scheduled/active sessions via Jitsi video
- View session status badges

### 4.6 Recordings
- View list of class recordings
- Watch recordings via external links

### 4.7 Certificates
- View earned certificates
- Preview certificates (PDF)
- Download certificate PDF
- Auto-issued when all lessons in a course are completed

### 4.8 Profile
- Edit name and email
- Sign out

### 4.9 Dashboard
- Welcome hero
- Upcoming live class
- Courses with progress bars
- Recent recording
- Certificates teaser

---

## 5. Workflows

### 5.1 Course Creation Flow (Admin)
1. Admin creates course (title, code, description)
2. Admin adds sections to course
3. Admin adds lessons to sections (text/video/image/assignment)
4. Admin creates quiz questions for the course
5. Admin creates a batch and assigns teacher + course
6. Admin assigns students to the batch

### 5.2 Live Class Flow (Teacher)
1. Teacher schedules a class (selects batch, date/time)
2. Session created with SCHEDULED status
3. Teacher starts class → Jitsi room opens, status → ACTIVE
4. Students see session in their dashboard and join
5. Class ends → status → COMPLETED
6. Recording link added (external)

### 5.3 Learning Flow (Student)
1. Student views enrolled courses on dashboard
2. Opens a course → sees sections and lessons
3. Navigates through lessons, marks each complete
4. Progress bar updates
5. Takes quiz when ready (20 questions, auto-graded)
6. Submits assignments when available
7. When all lessons complete → certificate auto-issued

### 5.4 Assignment Flow
1. Teacher creates assignment (title, description, points, course)
2. Student views assignment in course
3. Student submits work (text + optional file)
4. Teacher reviews submission
5. Teacher verifies: approve with score/feedback OR return with feedback for rework
6. Student can resubmit if returned

### 5.5 Certificate Flow
1. Student completes all lessons in a course
2. System auto-issues certificate with unique ID (CERT-XXXXXX)
3. OR admin manually issues certificate from admin panel
4. Student views/downloads PDF certificate
5. PDF generated using canvas-based template with token replacement

---

## 6. Business Rules

### 6.1 Roles & Permissions
| Action | Student | Teacher | Admin |
|---|---|---|---|
| View courses | Yes | Yes | Yes |
| Create courses | No | No | Yes |
| Edit courses | No | No | Yes |
| Manage course content | No | No | Yes |
| Create quizzes | No | Yes | Yes |
| Schedule live classes | No | Yes | Yes |
| Start live classes | No | Yes | Yes |
| Take quizzes | Yes | No | No |
| Submit assignments | Yes | No | No |
| Grade submissions | No | Yes | No |
| View all students | No | No | Yes |
| Create users | No | No | Yes |
| Assign teachers | No | No | Yes |
| Manage batches | No | View only | Yes |
| Issue certificates | No | No | Yes |
| View own certificates | Yes | No | Yes |

### 6.2 Lesson Types
- **Text**: Rendered as HTML content
- **Video**: Embedded iframe (YouTube, Vimeo, etc.)
- **Image**: Displayed from R2 URL
- **Assignment**: Prompt for student submission

### 6.3 Submission States
- **SUBMITTED**: Initial state when student submits
- **VERIFIED**: Teacher approved with score and feedback
- **RETURNED**: Teacher sent back for rework with feedback

### 6.4 Live Session States
- **SCHEDULED**: Class is planned, not yet started
- **ACTIVE**: Class is in progress (Jitsi room open)
- **COMPLETED**: Class has ended
- **CANCELLED**: Class was cancelled

### 6.5 Certificate Auto-Issue
- Triggered when a student marks the last incomplete lesson as complete
- Only issues if the student has completed ALL lessons in the course
- Prevents duplicate certificates for the same student-course pair

---

## 7. User Interface

### 7.1 Design System
- **Primary color**: #BF5700 (burnt orange)
- **Secondary**: #884D52 (muted red)
- **Tertiary**: #D69E2E (gold)
- **Font**: Hanken Grotesk
- **Dark mode**: Full support with theme toggle
- **Glass morphism**: Cards with backdrop blur

### 7.2 Navigation
- **Student**: Dashboard, Courses, Live Classes, Recordings, Certificates, Profile
- **Teacher**: Dashboard, Students, Batches, Live Classes, Assignments, Questions
- **Admin**: Dashboard, Students, Teachers, Courses, Batches, Certificates, Assignments
- Mobile: Bottom navigation bar
- Desktop: Sidebar navigation

### 7.3 Key UI Components
- Dashboard shell (role-specific layout)
- Modal dialogs
- Confirmation dialogs (danger actions)
- Toast notifications (success/error/info)
- Progress bars
- Loading skeletons
- Avatars (initial-based)
- Badges (status indicators)
- Search bar in header

---

## 8. External Integrations

### 8.1 Cloudflare R2 Storage
- File uploads: Images, assignment attachments
- Presigned URL generation for direct upload
- Public URL serving for uploaded files

### 8.2 Jitsi Meet
- Video conferencing for live classes
- Embedded via external API
- Auto-generated room names
- Supports 1:1 and batch sessions

### 8.3 Supabase PostgreSQL
- Database hosting via connection pooler
- Not using Supabase Auth (custom JWT)

---

## 9. Data Model Summary

| Entity | Key Fields |
|---|---|
| User | id, email, password, name, role (STUDENT/TEACHER/ADMIN), assignedTeacherId |
| Course | id, title, code, description |
| Section | id, courseId, title |
| Lesson | id, sectionId, title, type (text/video/image/assignment), content |
| Batch | id, name, teacherId, courseId, studentIds (many-to-many) |
| LiveSession | id, title, teacherId, batchId, courseId, scheduledAt, duration, type, status |
| Recording | id, sessionId, title, url, duration |
| Assignment | id, courseId, title, description, points, dueAt, createdBy |
| AssignmentSubmission | id, assignmentId, studentId, content, attachmentUrl, status, score, feedback |
| Question | id, courseId, question, options (JSON), correctIndex, explanation |
| QuizAttempt | id, studentId, courseId, score, total, answers (JSON) |
| LessonProgress | id, studentId, lessonId, completedAt |
| Certificate | id, studentId, courseId, templateId, issuedAt, publicId |
| CertificateTemplate | id, name, width, height, background, backgroundImage, elements (JSON) |

---

## 10. Environment Dependencies

| Service | Purpose |
|---|---|
| PostgreSQL (Supabase) | Database |
| Cloudflare R2 | File/image storage |
| Jitsi Meet (8x8.vc) | Video conferencing |
| Vercel/Next.js hosting | Application deployment |

---

## 11. Seed Data

The application includes demo data:
- 3 users (admin, teacher, student)
- 1 course: "Manual Testing Fundamentals" (QA-101) with 4 sections and 13 lessons
- 25 quiz questions about software testing
- 1 batch: "QA-101 Cohort"
- 1 assignment: "Week 2 Challenge: Design Test Cases"
- 2 certificate templates: "Modern" and "Classic"
- 1 certificate issued to the demo student

---

## 12. Known Limitations

- No social login (Google/GitHub)
- No password reset flow
- No payment integration
- No course categories/tags system
- No course pricing
- No course reviews/ratings
- No admin course approval workflow
- No analytics dashboard
- No email notifications
- No mobile app
- No API versioning
- No rate limiting implemented
- No CSRF protection
- No middleware-based route protection
- Auth token stored in localStorage (not httpOnly cookie)
- JWT secret has hardcoded fallback

---

## 13. Out of Scope (Current Version)

- Payment processing
- Social authentication
- Email notifications
- Mobile native app
- Multi-language support
- Content versioning
- SCORM/xAPI compliance
- Discussion forums
- Live chat
- AI-powered features