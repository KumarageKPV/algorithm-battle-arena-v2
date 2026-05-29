CREATE DATABASE AlgorithmBattleArina;
GO

USE master;
GO

USE AlgorithmBattleArina;
GO

CREATE SCHEMA AlgorithmBattleArinaSchema;
GO

-- Create Auth table first (referenced by other tables)
CREATE TABLE AlgorithmBattleArinaSchema.Auth (
    Email NVARCHAR(50) PRIMARY KEY,
    PasswordHash VARBINARY(MAX),
    PasswordSalt VARBINARY(MAX)
);

-- Create Teachers table
CREATE TABLE AlgorithmBattleArinaSchema.Teachers (
    TeacherId INT IDENTITY(1, 1) PRIMARY KEY,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(50) UNIQUE,
    Active BIT,
    -- Add foreign key constraint to Auth table
    CONSTRAINT FK_Teacher_Auth 
        FOREIGN KEY (Email) REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
);

-- Create Student table with foreign key relationships
CREATE TABLE AlgorithmBattleArinaSchema.Student (
    StudentId INT IDENTITY(1, 1) PRIMARY KEY,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(50) UNIQUE,
    TeacherId INT,
    Active BIT,
    -- Add foreign key constraints
    CONSTRAINT FK_Student_Teacher 
        FOREIGN KEY (TeacherId) REFERENCES AlgorithmBattleArinaSchema.Teachers(TeacherId),
    CONSTRAINT FK_Student_Auth 
        FOREIGN KEY (Email) REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
);

SELECT *FROM AlgorithmBattleArinaSchema.Auth;
SELECT *FROM AlgorithmBattleArinaSchema.Teachers;
SELECT *FROM AlgorithmBattleArinaSchema.Student;
SELECT *FROM AlgorithmBattleArinaSchema.Problems;
SELECT *FROM AlgorithmBattleArinaSchema.ProblemSolutions;
SELECT *FROM AlgorithmBattleArinaSchema.ProblemTestCases;

--------------------------------------------------------------------------------------

CREATE TABLE AlgorithmBattleArinaSchema.Problems (
    ProblemId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    DifficultyLevel NVARCHAR(50),
    Category NVARCHAR(100),
    TimeLimit INT,          -- in ms
    MemoryLimit INT,        -- in MB
    CreatedBy NVARCHAR(100),
    Tags NVARCHAR(MAX),     -- store as JSON string or comma-separated
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE AlgorithmBattleArinaSchema.ProblemTestCases (
    TestCaseId INT IDENTITY(1,1) PRIMARY KEY,
    ProblemId INT NOT NULL,
    InputData NVARCHAR(MAX),
    ExpectedOutput NVARCHAR(MAX),
    IsSample BIT DEFAULT 0,
    FOREIGN KEY (ProblemId) REFERENCES AlgorithmBattleArinaSchema.Problems(ProblemId) ON DELETE CASCADE
);

CREATE TABLE AlgorithmBattleArinaSchema.ProblemSolutions (
    SolutionId INT IDENTITY(1,1) PRIMARY KEY,
    ProblemId INT NOT NULL,
    Language NVARCHAR(50),
    SolutionText NVARCHAR(MAX),
    FOREIGN KEY (ProblemId) REFERENCES AlgorithmBattleArinaSchema.Problems(ProblemId) ON DELETE CASCADE
);
GO

CREATE OR ALTER PROCEDURE AlgorithmBattleArinaSchema.spUpsertProblem
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @DifficultyLevel NVARCHAR(50),
    @Category NVARCHAR(100),
    @TimeLimit INT,
    @MemoryLimit INT,
    @CreatedBy NVARCHAR(100),
    @Tags NVARCHAR(MAX),
    @TestCases NVARCHAR(MAX),
    @Solutions NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ProblemId INT;

    BEGIN TRANSACTION;

    -- Upsert Problems
    IF EXISTS (SELECT 1 FROM AlgorithmBattleArinaSchema.Problems WHERE Title = @Title)
    BEGIN
        UPDATE AlgorithmBattleArinaSchema.Problems
        SET Description = @Description,
            DifficultyLevel = @DifficultyLevel,
            Category = @Category,
            TimeLimit = @TimeLimit,
            MemoryLimit = @MemoryLimit,
            CreatedBy = @CreatedBy,
            Tags = @Tags
        WHERE Title = @Title;

        SELECT @ProblemId = ProblemId
        FROM AlgorithmBattleArinaSchema.Problems
        WHERE Title = @Title;
    END
    ELSE
    BEGIN
        INSERT INTO AlgorithmBattleArinaSchema.Problems
            (Title, Description, DifficultyLevel, Category, TimeLimit, MemoryLimit, CreatedBy, Tags)
        VALUES
            (@Title, @Description, @DifficultyLevel, @Category, @TimeLimit, @MemoryLimit, @CreatedBy, @Tags);

        SET @ProblemId = SCOPE_IDENTITY();
    END

    -- Upsert TestCases
    MERGE AlgorithmBattleArinaSchema.ProblemTestCases AS target
    USING (
        SELECT 
            JSON_VALUE(value, '$.inputData') AS InputData,
            JSON_VALUE(value, '$.expectedOutput') AS ExpectedOutput,
            CAST(JSON_VALUE(value, '$.isSample') AS BIT) AS IsSample
        FROM OPENJSON(@TestCases)
    ) AS source
    ON target.ProblemId = @ProblemId AND target.InputData = source.InputData
    WHEN MATCHED THEN
        UPDATE SET ExpectedOutput = source.ExpectedOutput, IsSample = source.IsSample
    WHEN NOT MATCHED THEN
        INSERT (ProblemId, InputData, ExpectedOutput, IsSample)
        VALUES (@ProblemId, source.InputData, source.ExpectedOutput, source.IsSample);

    -- Upsert Solutions
    MERGE AlgorithmBattleArinaSchema.ProblemSolutions AS target
    USING (
        SELECT 
            JSON_VALUE(value, '$.language') AS Language,
            JSON_VALUE(value, '$.solutionText') AS SolutionText
        FROM OPENJSON(@Solutions)
    ) AS source
    ON target.ProblemId = @ProblemId AND target.Language = source.Language
    WHEN MATCHED THEN
        UPDATE SET SolutionText = source.SolutionText
    WHEN NOT MATCHED THEN
        INSERT (ProblemId, Language, SolutionText)
        VALUES (@ProblemId, source.Language, source.SolutionText);

    COMMIT TRANSACTION;

    
    SELECT @ProblemId AS ProblemId;
END

GO

EXEC AlgorithmBattleArinaSchema.spUpsertProblem
    @Title = 'Updated Problem',
    @Description = 'Updated description',
    @DifficultyLevel = 'Hard',
    @Category = 'Data Structures',
    @TimeLimit = 2000,
    @MemoryLimit = 256,
    @CreatedBy = 'admin',
    @Tags = N'["graph","dfs"]',
    @TestCases = N'[{"inputData":"1 2 3","expectedOutput":"6","isSample":1}]',
    @Solutions = N'[{"language":"Java","solutionText":"class Solution { ... }"}]';





  -- ===========================================
-- LOBBIES
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.Lobbies (
    LobbyId INT IDENTITY(1,1) PRIMARY KEY,
    LobbyCode NVARCHAR(10) NOT NULL UNIQUE, -- short invite code
    HostEmail NVARCHAR(50) NOT NULL,
    LobbyName NVARCHAR(100) NOT NULL,
    IsPublic BIT NOT NULL DEFAULT 1,
    MaxPlayers INT NOT NULL DEFAULT 10,
    Mode NVARCHAR(20) CHECK (Mode IN ('1v1','Team','FreeForAll')) NOT NULL,
    Difficulty NVARCHAR(20) CHECK (Difficulty IN ('Easy','Medium','Hard','Mixed')) NOT NULL,
    Category NVARCHAR(100) NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Open','InProgress','Closed')) NOT NULL DEFAULT 'Open',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    StartedAt DATETIME2 NULL,
    EndedAt DATETIME2 NULL,

    CONSTRAINT FK_Lobby_Host FOREIGN KEY (HostEmail)
        REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
);


-- ===========================================
-- LOBBY PARTICIPANTS
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.LobbyParticipants (
    LobbyParticipantId INT IDENTITY(1,1) PRIMARY KEY,
    LobbyId INT NOT NULL,
    ParticipantEmail NVARCHAR(50) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('Host','Player','Spectator')) NOT NULL DEFAULT 'Player',
    JoinedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_LobbyParticipants_Lobby FOREIGN KEY (LobbyId)
        REFERENCES AlgorithmBattleArinaSchema.Lobbies(LobbyId)
        ON DELETE CASCADE,

    CONSTRAINT FK_LobbyParticipants_User FOREIGN KEY (ParticipantEmail)
        REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
        ON DELETE CASCADE,

    CONSTRAINT UQ_Lobby_Participant UNIQUE (LobbyId, ParticipantEmail)
);


-- ===========================================
-- MATCHES
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.Matches (
    MatchId INT IDENTITY(1,1) PRIMARY KEY,
    LobbyId INT NOT NULL,
    StartedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    EndedAt DATETIME2 NULL,

    CONSTRAINT FK_Match_Lobby FOREIGN KEY (LobbyId)
        REFERENCES AlgorithmBattleArinaSchema.Lobbies(LobbyId)
        ON DELETE CASCADE
);



-- ===========================================
-- MATCH PROBLEMS
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.MatchProblems (
    MatchProblemId INT IDENTITY(1,1) PRIMARY KEY,
    MatchId INT NOT NULL,
    ProblemId INT NOT NULL,

    CONSTRAINT FK_MatchProblems_Match FOREIGN KEY (MatchId)
        REFERENCES AlgorithmBattleArinaSchema.Matches(MatchId)
        ON DELETE CASCADE,

    CONSTRAINT FK_MatchProblems_Problem FOREIGN KEY (ProblemId)
        REFERENCES AlgorithmBattleArinaSchema.Problems(ProblemId)
        ON DELETE CASCADE
);


-- ===========================================
-- SUBMISSIONS
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.Submissions (
    SubmissionId INT IDENTITY(1,1) PRIMARY KEY,
    MatchId INT NOT NULL,
    ProblemId INT NOT NULL,
    ParticipantEmail NVARCHAR(50) NOT NULL,
    Language NVARCHAR(50) NOT NULL,
    Code NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Submitted',
    Score INT NULL,
    SubmittedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Submission_Match FOREIGN KEY (MatchId)
        REFERENCES AlgorithmBattleArinaSchema.Matches(MatchId)
        ON DELETE NO ACTION,

    CONSTRAINT FK_Submission_Problem FOREIGN KEY (ProblemId)
        REFERENCES AlgorithmBattleArinaSchema.Problems(ProblemId),

    CONSTRAINT FK_Submission_Participant FOREIGN KEY (ParticipantEmail)
        REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
);

------------------------------------------------------------------------------------------
-- STUDENT-TEACHER REQUESTS
CREATE TABLE AlgorithmBattleArinaSchema.StudentTeacherRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL,
    TeacherId INT NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Pending', 'Accepted', 'Rejected')) NOT NULL DEFAULT 'Pending',
    RequestedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_StudentTeacherRequests_Student FOREIGN KEY (StudentId)
        REFERENCES AlgorithmBattleArinaSchema.Student(StudentId)
        ON DELETE CASCADE,

    CONSTRAINT FK_StudentTeacherRequests_Teacher FOREIGN KEY (TeacherId)
        REFERENCES AlgorithmBattleArinaSchema.Teachers(TeacherId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_Student_Teacher_Request UNIQUE (StudentId, TeacherId)
);
GO

CREATE TABLE AlgorithmBattleArinaSchema.AuditLog (
    AuditLogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(100),
    Action NVARCHAR(100),
    EntityType NVARCHAR(100),
    EntityId NVARCHAR(100),
    BeforeState NVARCHAR(MAX),
    AfterState NVARCHAR(MAX),
    CorrelationId NVARCHAR(100),
    Timestamp DATETIME2 DEFAULT GETDATE()
);
GO


CREATE TABLE AlgorithmBattleArinaSchema.Friends (
    FriendshipId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId1 INT NOT NULL,
    StudentId2 INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_Friends_Student1 FOREIGN KEY (StudentId1) 
        REFERENCES AlgorithmBattleArinaSchema.Student(StudentId),
    CONSTRAINT FK_Friends_Student2 FOREIGN KEY (StudentId2) 
        REFERENCES AlgorithmBattleArinaSchema.Student(StudentId),
    CONSTRAINT UQ_Friendship UNIQUE (StudentId1, StudentId2)
);
GO
-- ===========================================
-- FRIEND REQUESTS
-- ===========================================
CREATE TABLE AlgorithmBattleArinaSchema.FriendRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Pending', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    RequestedAt DATETIME2 DEFAULT GETDATE(),
    RespondedAt DATETIME2 NULL,
    
    CONSTRAINT FK_FriendRequests_Sender FOREIGN KEY (SenderId) 
        REFERENCES AlgorithmBattleArinaSchema.Student(StudentId),
    CONSTRAINT FK_FriendRequests_Receiver FOREIGN KEY (ReceiverId) 
        REFERENCES AlgorithmBattleArinaSchema.Student(StudentId),
    CONSTRAINT UQ_Friend_Request UNIQUE (SenderId, ReceiverId)
);
GO

CREATE TABLE AlgorithmBattleArinaSchema.Conversations (
    ConversationId INT IDENTITY(1,1) PRIMARY KEY,
    Type NVARCHAR(20) CHECK (Type IN ('Friend', 'Lobby', 'TeacherStudent', 'Match')) NOT NULL,
    ReferenceId INT NULL, -- LobbyId, MatchId, or NULL for friend chats
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE AlgorithmBattleArinaSchema.ConversationParticipants (
    ConversationParticipantId INT IDENTITY(1,1) PRIMARY KEY,
    ConversationId INT NOT NULL,
    ParticipantEmail NVARCHAR(50) NOT NULL,
    JoinedAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_ConversationParticipants_Conversation 
        FOREIGN KEY (ConversationId) REFERENCES AlgorithmBattleArinaSchema.Conversations(ConversationId) ON DELETE CASCADE,
    CONSTRAINT FK_ConversationParticipants_Auth 
        FOREIGN KEY (ParticipantEmail) REFERENCES AlgorithmBattleArinaSchema.Auth(Email),
    CONSTRAINT UQ_Conversation_Participant UNIQUE (ConversationId, ParticipantEmail)
);
GO

CREATE TABLE AlgorithmBattleArinaSchema.Messages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    ConversationId INT NOT NULL,
    SenderEmail NVARCHAR(50) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    SentAt DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_Messages_Conversation 
        FOREIGN KEY (ConversationId) REFERENCES AlgorithmBattleArinaSchema.Conversations(ConversationId) ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Sender 
        FOREIGN KEY (SenderEmail) REFERENCES AlgorithmBattleArinaSchema.Auth(Email)
);
GO