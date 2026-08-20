import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.test" },
    update: {},
    create: {
      email: "admin@lms.test",
      password: "$2a$10$mstOM9itMg7iooy7qFsgBO8gwE5dtnOwUcW8f0Oltry6Y7TOis48e",
      name: "System Admin",
      role: "ADMIN",
    },
  });
  console.log("admin", admin.id);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@lms.test" },
    update: {},
    create: {
      email: "teacher@lms.test",
      password: "$2a$10$y0RXw2lpmmiKa.peLCA9XemRJXL0Yvewrxm2haqWPlykgn6sxkADS",
      name: "Dr. Ahmed Khan",
      role: "TEACHER",
    },
  });
  console.log("teacher", teacher.id);

  const student = await prisma.user.upsert({
    where: { email: "student@lms.test" },
    update: { assignedTeacherId: teacher.id },
    create: {
      email: "student@lms.test",
      password: "$2a$10$GSF42JwsSy6RVnHUK.hiIO340PjKXS317xUHflr02erUmxJWRzDVK",
      name: "Maya Patel",
      role: "STUDENT",
      assignedTeacherId: teacher.id,
    },
  });
  console.log("student", student.id);

  const course = await prisma.course.upsert({
    where: { code: "QA-101" },
    update: {},
    create: {
      title: "Manual Testing Fundamentals",
      code: "QA-101",
      description:
        "Learn the fundamentals of manual software testing: principles, test design techniques, execution, defect management, and agile testing.",
    },
  });
  console.log("course", course.id);

  const sections: { title: string; lessons: { title: string; type: string; content: string }[] }[] = [
    {
      title: "Week 1 – Testing Fundamentals",
      lessons: [
        {
          title: "What is Software Testing?",
          type: "text",
          content:
            "Software testing is the process of evaluating and verifying that a software product or application does what it is supposed to do. Its purpose is to identify bugs, reduce defects, and ensure quality before release.\n\nKey goals:\n• Verify the software meets requirements\n• Identify bugs and defects early\n• Prevent defects from reaching end users\n• Build confidence in the product\n\nTesting is not just about finding bugs — it also provides information about the quality of the product and its readiness for release.",
        },
        {
          title: "Testing Principles",
          type: "text",
          content:
            "Seven fundamental principles guide effective testing:\n\n1. Testing shows the presence of defects, not their absence.\n2. Exhaustive testing is impossible — you cannot test everything.\n3. Early testing saves time and money.\n4. Defects cluster together (Pareto principle).\n5. Beware of the pesticide paradox — repeat the same tests and they stop finding new bugs.\n6. Testing is context dependent.\n7. Absence-of-errors fallacy — a bug-free app can still be unusable.\n\nKeep these in mind when you plan your test strategy.",
        },
        {
          title: "The Test Pyramid",
          type: "text",
          content:
            "The test pyramid describes the ideal distribution of automated and manual testing across layers:\n\n• Unit tests (bottom, many) — test individual functions and modules.\n• Integration tests (middle) — verify that modules work together.\n• End-to-end / UI tests (top, few) — validate complete user journeys.\n\nManual testing focuses mostly on the top layers: exploratory, usability, and end-to-end scenarios that are hard to automate.",
        },
      ],
    },
    {
      title: "Week 2 – Test Design",
      lessons: [
        {
          title: "Writing Effective Test Cases",
          type: "text",
          content:
            "A test case is a set of actions executed to verify a specific feature. A well-written test case includes:\n\n• Test case ID and title\n• Preconditions\n• Test data\n• Steps to execute\n• Expected results\n• Actual results (filled during execution)\n• Status (pass/fail/blocked)\n\nWrite test cases in simple, unambiguous language so any team member can execute them consistently.",
        },
        {
          title: "Equivalence Partitioning",
          type: "text",
          content:
            "Equivalence partitioning divides input data into partitions where each value behaves the same way. You only need to test one representative from each partition.\n\nExample: an age field that accepts 18–60.\n• Valid partition: 18–60 (test 30)\n• Below boundary: < 18 (test 10)\n• Above boundary: > 60 (test 70)\n\nThis technique dramatically reduces the number of test cases while keeping coverage high.",
        },
        {
          title: "Boundary Value Analysis",
          type: "text",
          content:
            "Boundary value analysis (BVA) focuses testing on the boundaries between partitions, because defects most often occur at edges.\n\nFor an input range of 18–60, test:\n• Minimum boundary: 18\n• Just below: 17\n• Maximum boundary: 60\n• Just above: 61\n• A nominal value: 30\n\nCombine BVA with equivalence partitioning for thorough and efficient test coverage.",
        },
      ],
    },
    {
      title: "Week 3 – Test Execution & Defects",
      lessons: [
        {
          title: "Executing Test Cases",
          type: "text",
          content:
            "Test execution means running test cases and recording results. Best practices:\n\n• Execute in priority order — critical paths first.\n• Record actual results immediately.\n• Take screenshots for evidence.\n• Track execution status (pass, fail, blocked, not run).\n• Re-test fixed defects before closing them.\n\nAlways retest after a build change to confirm the fix works and nothing else broke (regression).",
        },
        {
          title: "Test Reports & Metrics",
          type: "text",
          content:
            "A test summary report communicates the health of the release. It typically includes:\n\n• Total test cases and pass rate\n• Open vs closed defects\n• Defects by severity and priority\n• Areas of risk\n• Overall recommendation (go / no-go)\n\nUseful metrics: test coverage, defect density, escaped defects, and test execution rate.",
        },
        {
          title: "The Defect Lifecycle",
          type: "text",
          content:
            "A defect (bug) moves through states as it is handled:\n\nNew → Assigned → Open → Fixed → (Re)Test → Verified/Closed\n\nCommon additional states: Deferred, Duplicate, Won’t Fix, Not a Bug, Reopened.\n\nA good defect report includes a clear title, steps to reproduce, expected vs actual results, environment details, and severity/priority.",
        },
      ],
    },
    {
      title: "Week 4 – Agile & Test Management",
      lessons: [
        {
          title: "Smoke, Sanity & Regression Testing",
          type: "text",
          content:
            "Three quick but crucial test types:\n\n• Smoke testing — a shallow, wide pass over the build to verify critical functionality works before deeper testing. A build that fails smoke testing is rejected.\n• Sanity testing — a narrow, targeted check that a specific fix works.\n• Regression testing — re-running existing tests to ensure new changes did not break existing functionality.",
        },
        {
          title: "Testing in Agile",
          type: "text",
          content:
            "In agile development, testing is continuous rather than a final phase. Key ideas:\n\n• Testing happens in every sprint.\n• Testers collaborate with developers and product owners daily.\n• Automation supports fast feedback loops.\n• Manual exploratory testing adds value beyond scripts.\n• Definition of Done includes tests passing and quality criteria met.",
        },
        {
          title: "Tools: Jira & Test Management",
          type: "text",
          content:
            "Testers use tools to organize work:\n\n• Jira — issue/defect tracking, sprint boards, backlog grooming.\n• TestRail / Zephyr — test case management, execution tracking, reports.\n• Postman — API testing.\n• Browser DevTools — debugging and UI inspection.\n\nChoose tools that support your workflow; the tool serves the process, not the other way around.",
        },
        {
          title: "Week 4 Capstone: Full Test Cycle",
          type: "assignment",
          content:
            "Your final task: run a complete test cycle on a real build.\n\nDeliverables:\n1. Execute at least 15 test cases on the app/website of your choice (use the techniques from Weeks 1–3).\n2. Log every defect you find using the defect lifecycle (New → … → Verified/Closed).\n3. Write a one-page test summary report with pass rate, open defects by severity, and a go/no-go recommendation.\n\nSubmit your report through the Assignments section on the course page. Your teacher grades it for coverage, edge-case thinking, and clarity — top marks go to testers who break the app and explain why.",
        },
      ],
    },
  ];

  for (const s of sections) {
    const section = await prisma.section.create({
      data: { courseId: course.id, title: s.title },
    });
    for (const l of s.lessons) {
      await prisma.lesson.create({
        data: { sectionId: section.id, title: l.title, type: l.type, content: l.content },
      });
      console.log("lesson", l.title);
    }
  }

  const questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[] = [
    { question: "What is the primary purpose of software testing?", options: ["To make the code faster", "To evaluate and verify that the software meets requirements and identify defects", "To replace developers", "To write documentation"], correctIndex: 1, explanation: "Testing evaluates and verifies software against requirements while identifying bugs." },
    { question: "Which principle states that exhaustive testing is impossible?", options: ["Early testing", "Defect clustering", "Exhaustive testing is impossible", "Pesticide paradox"], correctIndex: 2 },
    { question: "The pesticide paradox means that:", options: ["Tests kill bugs permanently", "Repeating the same tests eventually stops finding new defects", "Pesticides are used in QA labs", "Bugs never die"], correctIndex: 1, explanation: "Same tests, repeated, find fewer and fewer new defects — so tests must evolve." },
    { question: "Which testing principle says defects tend to cluster in a few modules?", options: ["Absence-of-errors fallacy", "Defect clustering (Pareto)", "Context dependent", "Early testing"], correctIndex: 1 },
    { question: "What does \"testing shows the presence of defects\" imply?", options: ["A clean test run proves the software is bug-free", "Testing can only show bugs exist, not prove none exist", "Defects are always present", "Testing is unnecessary"], correctIndex: 1 },
    { question: "In the test pyramid, which layer has the most tests?", options: ["End-to-end tests", "UI tests", "Unit tests", "Manual tests"], correctIndex: 2 },
    { question: "Manual testing is most valuable at which layer?", options: ["Unit layer", "Integration layer", "Exploratory and end-to-end scenarios", "Compiler checks"], correctIndex: 2 },
    { question: "Which of the following is NOT a typical field in a test case?", options: ["Test case ID", "Expected result", "Steps to reproduce", "Server password"], correctIndex: 3 },
    { question: "A valid partition for an age field accepting 18–60 is:", options: ["5", "30", "65", "-1"], correctIndex: 1 },
    { question: "Equivalence partitioning helps by:", options: ["Increasing total test count", "Testing every possible input", "Selecting one representative value from each partition", "Randomizing inputs"], correctIndex: 2 },
    { question: "Boundary value analysis focuses on:", options: ["Middle values only", "Values at the edges of input ranges", "Random values", "Null values only"], correctIndex: 1 },
    { question: "For an input range of 18–60, the minimum boundary test value is:", options: ["0", "18", "60", "17"], correctIndex: 1 },
    { question: "Combining equivalence partitioning with BVA:", options: ["Reduces coverage", "Increases cost without benefit", "Improves coverage while keeping tests efficient", "Is not allowed"], correctIndex: 2 },
    { question: "Which is the correct first step in the defect lifecycle?", options: ["Closed", "Fixed", "New", "Verified"], correctIndex: 2 },
    { question: "A defect marked as \"Deferred\" means:", options: ["It will be fixed in a later release", "It is closed permanently", "It was never a defect", "It is being retested"], correctIndex: 0 },
    { question: "What does \"severity\" describe about a defect?", options: ["How soon it must be fixed", "The impact on the system", "Who reported it", "Which module it is in"], correctIndex: 1 },
    { question: "A build that fails smoke testing should be:", options: ["Retested repeatedly", "Accepted and tested further", "Rejected and returned to the team", "Ignored"], correctIndex: 2 },
    { question: "Smoke testing is best described as:", options: ["A deep check of one feature", "A shallow, wide pass to verify critical functionality", "Automated load testing", "Performance benchmarking"], correctIndex: 1 },
    { question: "Sanity testing is:", options: ["A broad full-suite run", "A narrow check that a specific fix works", "Testing on the same data", "Random testing"], correctIndex: 1 },
    { question: "Regression testing ensures:", options: ["New features are added", "New changes did not break existing functionality", "The build is faster", "Bugs are never introduced"], correctIndex: 1 },
    { question: "In agile, testing:", options: ["Happens only at the end", "Is continuous across every sprint", "Is done only by developers", "Is optional"], correctIndex: 1 },
    { question: "Which tool is primarily used for defect tracking in agile teams?", options: ["Postman", "Jira", "Photoshop", "Excel only"], correctIndex: 1 },
    { question: "The absence-of-errors fallacy warns that:", options: ["Errors never happen", "A bug-free app may still be unusable", "Only errors matter", "Errors are always found"], correctIndex: 1 },
    { question: "Which metric represents the percentage of executed tests that passed?", options: ["Defect density", "Pass rate", "Escaped defects", "Test coverage"], correctIndex: 1 },
    { question: "What should a good defect report include?", options: ["Only the error message", "Steps to reproduce, expected vs actual, environment", "The developer name only", "Just a screenshot"], correctIndex: 1 },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        courseId: course.id,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? "",
      },
    });
    console.log("question", q.question.slice(0, 40));
  }

  const batch = await prisma.batch.upsert({
    where: { id: "09f8ab60-495c-46d2-83ea-c0a9138c92b8" },
    update: {},
    create: {
      name: "QA-101 Cohort",
      teacherId: teacher.id,
      courseId: course.id,
    },
  });
  console.log("batch", batch.id);

  const assignment = await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: "Week 2 Challenge: Design Test Cases",
      description:
        "Using equivalence partitioning and boundary value analysis, design test cases for an age input field that accepts values from 18 to 60. Submit your test case table.",
      points: 10,
      createdBy: teacher.id,
    },
  });
  console.log("assignment", assignment.id);

  const classicElements = [
    { id: "title", type: "text", x: 60, y: 95, width: 722, text: "Certificate of Completion", fontSize: 34, fontFamily: "serif", fontWeight: "bold", color: "#BF5700", align: "center" },
    { id: "intro", type: "text", x: 60, y: 175, width: 722, text: "This certifies that", fontSize: 16, fontFamily: "sans", fontWeight: "normal", color: "#2D3748", align: "center" },
    { id: "student", type: "text", x: 60, y: 205, width: 722, text: "{student_name}", fontSize: 30, fontFamily: "serif", fontWeight: "bold", color: "#1F2937", align: "center" },
    { id: "body", type: "text", x: 60, y: 265, width: 722, text: "has successfully completed the course", fontSize: 16, fontFamily: "sans", fontWeight: "normal", color: "#2D3748", align: "center" },
    { id: "course", type: "text", x: 60, y: 300, width: 722, text: "{course_name}", fontSize: 24, fontFamily: "sans", fontWeight: "bold", color: "#BF5700", align: "center" },
    { id: "rule", type: "line", x: 300, y: 350, width: 242, color: "#E8C9A1", thickness: 2 },
    { id: "id", type: "text", x: 60, y: 385, width: 722, text: "Certificate ID: {certificate_id}", fontSize: 11, fontFamily: "sans", fontWeight: "normal", color: "#6B7280", align: "center" },
    { id: "date", type: "text", x: 60, y: 405, width: 722, text: "Issued on {date}", fontSize: 11, fontFamily: "sans", fontWeight: "normal", color: "#6B7280", align: "center" },
  ];

  const modernElements = [
    { id: "band", type: "rect", x: 0, y: 0, width: 16, height: 595.28, fill: "#2D7D6E" },
    { id: "accent", type: "line", x: 80, y: 120, width: 120, color: "#2D7D6E", thickness: 4 },
    { id: "title", type: "text", x: 80, y: 140, width: 640, text: "CERTIFICATE OF ACHIEVEMENT", fontSize: 22, fontFamily: "sans", fontWeight: "bold", color: "#2D7D6E", align: "left" },
    { id: "intro", type: "text", x: 80, y: 230, width: 640, text: "This certificate is proudly presented to", fontSize: 16, fontFamily: "sans", fontWeight: "normal", color: "#4A5568", align: "left" },
    { id: "student", type: "text", x: 80, y: 260, width: 640, text: "{student_name}", fontSize: 32, fontFamily: "serif", fontWeight: "bold", color: "#1A202C", align: "left" },
    { id: "body", type: "text", x: 80, y: 330, width: 640, text: "for successfully completing the course {course_name} ({course_code})", fontSize: 15, fontFamily: "sans", fontWeight: "normal", color: "#2D3748", align: "left" },
    { id: "date", type: "text", x: 80, y: 420, width: 640, text: "Issued on {date}", fontSize: 12, fontFamily: "sans", fontWeight: "normal", color: "#718096", align: "left" },
    { id: "id", type: "text", x: 80, y: 445, width: 640, text: "Certificate ID: {certificate_id}", fontSize: 11, fontFamily: "sans", fontWeight: "normal", color: "#A0AEC0", align: "left" },
  ];

  const modern = await prisma.certificateTemplate.create({
    data: {
      name: "Modern",
      description: "Clean teal accent design",
      background: "#F7FAFA",
      borderStyle: "solid",
      borderWidth: 3,
      borderColor: "#2D7D6E",
      elements: modernElements as any,
    },
  });

  const classic = await prisma.certificateTemplate.create({
    data: {
      name: "Classic",
      description: "Traditional serif certificate",
      background: "#FFFDF7",
      borderStyle: "double",
      borderWidth: 3,
      borderColor: "#BF5700",
      elements: classicElements as any,
    },
  });
  console.log("templates", modern.id, classic.id);

  const existingCert = await prisma.certificate.findFirst({
    where: { studentId: student.id, courseId: course.id },
  });
  if (!existingCert) {
    await prisma.certificate.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        templateId: modern.id,
        publicId: "CERT-" + Math.floor(100000 + Math.random() * 899999),
      },
    });
    console.log("certificate created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
