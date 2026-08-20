-- CreateTable
CREATE TABLE "auth" (
    "email" VARCHAR(50) NOT NULL,
    "password_hash" BYTEA NOT NULL,
    "password_salt" BYTEA NOT NULL,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "teachers" (
    "teacher_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(50) NOT NULL,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "student" (
    "student_id" SERIAL NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(50) NOT NULL,
    "teacher_id" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "problems" (
    "problem_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty_level" VARCHAR(50),
    "category" VARCHAR(100),
    "time_limit" INTEGER,
    "memory_limit" INTEGER,
    "created_by" VARCHAR(100),
    "tags" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("problem_id")
);

-- CreateTable
CREATE TABLE "problem_test_cases" (
    "test_case_id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input_data" TEXT,
    "expected_output" TEXT,
    "is_sample" BOOLEAN DEFAULT false,

    CONSTRAINT "problem_test_cases_pkey" PRIMARY KEY ("test_case_id")
);

-- CreateTable
CREATE TABLE "problem_solutions" (
    "solution_id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "language" VARCHAR(50),
    "solution_text" TEXT,

    CONSTRAINT "problem_solutions_pkey" PRIMARY KEY ("solution_id")
);

-- CreateTable
CREATE TABLE "lobbies" (
    "lobby_id" SERIAL NOT NULL,
    "lobby_code" VARCHAR(10) NOT NULL,
    "host_email" VARCHAR(50) NOT NULL,
    "lobby_name" VARCHAR(100) NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "max_players" INTEGER NOT NULL DEFAULT 10,
    "mode" VARCHAR(20) NOT NULL,
    "difficulty" VARCHAR(20) NOT NULL,
    "category" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL DEFAULT 'Open',
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ,
    "ended_at" TIMESTAMPTZ,

    CONSTRAINT "lobbies_pkey" PRIMARY KEY ("lobby_id")
);

-- CreateTable
CREATE TABLE "lobby_participants" (
    "lobby_participant_id" SERIAL NOT NULL,
    "lobby_id" INTEGER NOT NULL,
    "participant_email" VARCHAR(50) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'Player',
    "joined_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lobby_participants_pkey" PRIMARY KEY ("lobby_participant_id")
);

-- CreateTable
CREATE TABLE "matches" (
    "match_id" SERIAL NOT NULL,
    "lobby_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "match_problems" (
    "match_problem_id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,

    CONSTRAINT "match_problems_pkey" PRIMARY KEY ("match_problem_id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "submission_id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "participant_email" VARCHAR(50) NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "code" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Submitted',
    "score" INTEGER,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("submission_id")
);

-- CreateTable
CREATE TABLE "student_teacher_requests" (
    "request_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Pending',
    "requested_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_teacher_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "audit_log_id" SERIAL NOT NULL,
    "user_id" VARCHAR(100),
    "action" VARCHAR(100),
    "entity_type" VARCHAR(100),
    "entity_id" VARCHAR(100),
    "before_state" TEXT,
    "after_state" TEXT,
    "correlation_id" VARCHAR(100),
    "timestamp" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateTable
CREATE TABLE "friends" (
    "friendship_id" SERIAL NOT NULL,
    "student_id_1" INTEGER NOT NULL,
    "student_id_2" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("friendship_id")
);

-- CreateTable
CREATE TABLE "friend_requests" (
    "request_id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Pending',
    "requested_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMPTZ,

    CONSTRAINT "friend_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "conversation_id" SERIAL NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "reference_id" INTEGER,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversation_participant_id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "participant_email" VARCHAR(50) NOT NULL,
    "joined_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_participant_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_email" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_email_key" ON "student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lobbies_lobby_code_key" ON "lobbies"("lobby_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_lobby_participant" ON "lobby_participants"("lobby_id", "participant_email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_student_teacher_request" ON "student_teacher_requests"("student_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_friendship" ON "friends"("student_id_1", "student_id_2");

-- CreateIndex
CREATE UNIQUE INDEX "uq_friend_request" ON "friend_requests"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_conversation_participant" ON "conversation_participants"("conversation_id", "participant_email");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_email_fkey" FOREIGN KEY ("email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_email_fkey" FOREIGN KEY ("email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_test_cases" ADD CONSTRAINT "problem_test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("problem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_solutions" ADD CONSTRAINT "problem_solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("problem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobbies" ADD CONSTRAINT "lobbies_host_email_fkey" FOREIGN KEY ("host_email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobby_participants" ADD CONSTRAINT "lobby_participants_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "lobbies"("lobby_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lobby_participants" ADD CONSTRAINT "lobby_participants_participant_email_fkey" FOREIGN KEY ("participant_email") REFERENCES "auth"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "lobbies"("lobby_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_problems" ADD CONSTRAINT "match_problems_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_problems" ADD CONSTRAINT "match_problems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("problem_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("problem_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_participant_email_fkey" FOREIGN KEY ("participant_email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_teacher_requests" ADD CONSTRAINT "student_teacher_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_teacher_requests" ADD CONSTRAINT "student_teacher_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_student_id_1_fkey" FOREIGN KEY ("student_id_1") REFERENCES "student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_student_id_2_fkey" FOREIGN KEY ("student_id_2") REFERENCES "student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_participant_email_fkey" FOREIGN KEY ("participant_email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_email_fkey" FOREIGN KEY ("sender_email") REFERENCES "auth"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
