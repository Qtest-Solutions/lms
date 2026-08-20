-- Rename implicit many-to-many join tables to match Prisma naming.
-- The initial migration created them as _BatchToUser / _LiveSessionToUser / _RecordingToUser,
-- but Prisma 5 expects _BatchStudents / _SessionStudents / _RecordingStudents.

ALTER TABLE "_BatchToUser" RENAME TO "_BatchStudents";
ALTER TABLE "_LiveSessionToUser" RENAME TO "_SessionStudents";
ALTER TABLE "_RecordingToUser" RENAME TO "_RecordingStudents";
