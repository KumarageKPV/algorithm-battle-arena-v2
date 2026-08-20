-- =============================================================================
-- Algorithm Battle Arena — PostgreSQL Schema
-- Migrated from MSSQL (AlgorithmBattleArinaSchema) → PostgreSQL (public)
-- 16 tables + constraints preserved
-- Note: This is used by docker-compose for local dev initialization.
-- For production, use Prisma migrations.
-- =============================================================================

-- Auth table (referenced by most other tables)
CREATE TABLE IF NOT EXISTS auth (
    email VARCHAR(50) PRIMARY KEY,
    password_hash BYTEA NOT NULL,
    password_salt BYTEA NOT NULL
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_teacher_auth FOREIGN KEY (email) REFERENCES auth(email)
);

-- Student
CREATE TABLE IF NOT EXISTS student (
    student_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(50) UNIQUE,
    teacher_id INT,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_student_auth FOREIGN KEY (email) REFERENCES auth(email),
    CONSTRAINT fk_student_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- Problems
CREATE TABLE IF NOT EXISTS problems (
    problem_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(50),
    category VARCHAR(100),
    time_limit INT,
    memory_limit INT,
    created_by VARCHAR(100),
    tags TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ProblemTestCases
CREATE TABLE IF NOT EXISTS problem_test_cases (
    test_case_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_id INT NOT NULL,
    input_data TEXT,
    expected_output TEXT,
    is_sample BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_testcase_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
);

-- ProblemSolutions
CREATE TABLE IF NOT EXISTS problem_solutions (
    solution_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_id INT NOT NULL,
    language VARCHAR(50),
    solution_text TEXT,
    CONSTRAINT fk_solution_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
);

-- Lobbies
CREATE TABLE IF NOT EXISTS lobbies (
    lobby_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lobby_code VARCHAR(10) NOT NULL UNIQUE,
    host_email VARCHAR(50) NOT NULL,
    lobby_name VARCHAR(100) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    max_players INT NOT NULL DEFAULT 10,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('1v1', 'Team', 'FreeForAll')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Mixed')),
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'InProgress', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    CONSTRAINT fk_lobby_host FOREIGN KEY (host_email) REFERENCES auth(email)
);

-- LobbyParticipants
CREATE TABLE IF NOT EXISTS lobby_participants (
    lobby_participant_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lobby_id INT NOT NULL,
    participant_email VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Player' CHECK (role IN ('Host', 'Player', 'Spectator')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_lp_lobby FOREIGN KEY (lobby_id) REFERENCES lobbies(lobby_id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_user FOREIGN KEY (participant_email) REFERENCES auth(email) ON DELETE CASCADE,
    CONSTRAINT uq_lobby_participant UNIQUE (lobby_id, participant_email)
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    match_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lobby_id INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    CONSTRAINT fk_match_lobby FOREIGN KEY (lobby_id) REFERENCES lobbies(lobby_id) ON DELETE CASCADE
);

-- MatchProblems
CREATE TABLE IF NOT EXISTS match_problems (
    match_problem_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id INT NOT NULL,
    problem_id INT NOT NULL,
    CONSTRAINT fk_mp_match FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    match_id INT NOT NULL,
    problem_id INT NOT NULL,
    participant_email VARCHAR(50) NOT NULL,
    language VARCHAR(50) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Submitted',
    score INT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sub_match FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE NO ACTION,
    CONSTRAINT fk_sub_problem FOREIGN KEY (problem_id) REFERENCES problems(problem_id),
    CONSTRAINT fk_sub_participant FOREIGN KEY (participant_email) REFERENCES auth(email)
);

-- StudentTeacherRequests
CREATE TABLE IF NOT EXISTS student_teacher_requests (
    request_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_str_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_str_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_teacher_request UNIQUE (student_id, teacher_id)
);

-- AuditLog
CREATE TABLE IF NOT EXISTS audit_log (
    audit_log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    before_state TEXT,
    after_state TEXT,
    correlation_id VARCHAR(100),
    "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

-- Friends
CREATE TABLE IF NOT EXISTS friends (
    friendship_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id_1 INT NOT NULL,
    student_id_2 INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_friends_student1 FOREIGN KEY (student_id_1) REFERENCES student(student_id),
    CONSTRAINT fk_friends_student2 FOREIGN KEY (student_id_2) REFERENCES student(student_id),
    CONSTRAINT uq_friendship UNIQUE (student_id_1, student_id_2)
);

-- FriendRequests
CREATE TABLE IF NOT EXISTS friend_requests (
    request_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    CONSTRAINT fk_fr_sender FOREIGN KEY (sender_id) REFERENCES student(student_id),
    CONSTRAINT fk_fr_receiver FOREIGN KEY (receiver_id) REFERENCES student(student_id),
    CONSTRAINT uq_friend_request UNIQUE (sender_id, receiver_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Friend', 'Lobby', 'TeacherStudent', 'Match')),
    reference_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ConversationParticipants
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_participant_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id INT NOT NULL,
    participant_email VARCHAR(50) NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_cp_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_auth FOREIGN KEY (participant_email) REFERENCES auth(email),
    CONSTRAINT uq_conversation_participant UNIQUE (conversation_id, participant_email)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    message_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_email VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_email) REFERENCES auth(email)
);

