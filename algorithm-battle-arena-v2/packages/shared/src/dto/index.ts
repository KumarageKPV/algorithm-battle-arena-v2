// =============================================================================
// Algorithm Battle Arena — Shared DTOs
// Port of all 30 C# DTOs from AlgorithmBattleArena/Dtos/
// =============================================================================

// ─── Auth ──────────────────────────────────────────────────────────

export interface UserForLoginDto {
  email: string;
  password: string;
}

export interface StudentForRegistrationDto {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  teacherId?: number;
  role?: string;
}

export interface TeacherForRegistrationDto {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthTokenResponse {
  token: string;
  role: string;
  email: string;
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  teacherId?: number;
}

// ─── Problems ──────────────────────────────────────────────────────

export interface ProblemUpsertDto {
  title: string;
  description: string;
  difficultyLevel?: string;
  category?: string;
  timeLimit?: number;
  memoryLimit?: number;
  createdBy?: string;
  tags?: string;
  testCases?: string;
  solutions?: string;
}

export interface ProblemResponseDto {
  problemId: number;
  title: string;
  description: string;
  difficultyLevel: string | null;
  category: string | null;
  timeLimit: number | null;
  memoryLimit: number | null;
  createdBy: string | null;
  tags: string | null;
  createdAt: string;
  testCases: TestCaseDto[];
  solutions: SolutionDto[];
}

export interface ProblemListDto {
  problemId: number;
  title: string;
  difficultyLevel: string | null;
  category: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ProblemFilterDto {
  category?: string;
  difficultyLevel?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface ProblemGenerationDto {
  language: string;
  difficulty: string;
  maxProblems: number;
}

export interface TestCaseDto {
  testCaseId?: number;
  inputData: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface SolutionDto {
  solutionId?: number;
  language: string;
  solutionText: string;
}

// ─── Import ────────────────────────────────────────────────────────

export interface ImportedProblemDto {
  title: string;
  description: string;
  difficultyLevel?: string;
  category?: string;
  timeLimit?: number;
  memoryLimit?: number;
  createdBy?: string;
  tags?: string[];
  testCases: TestCaseDto[];
  solutions: SolutionDto[];
}

export interface ImportErrorDto {
  row: number;
  field: string;
  message: string;
}

export interface ImportResultDto {
  ok: boolean;
  inserted: number;
  slugs: string[];
  errors: ImportErrorDto[];
}

// ─── Lobbies ───────────────────────────────────────────────────────

export interface LobbyCreateDto {
  name: string;
  maxPlayers?: number;
  mode?: string;
  difficulty?: string;
}

export interface LobbyDto {
  lobbyId: number;
  lobbyCode: string;
  hostEmail: string;
  lobbyName: string;
  isPublic: boolean;
  maxPlayers: number;
  mode: string;
  difficulty: string;
  status: string;
  createdAt: string;
  participants: LobbyParticipantDto[];
}

export interface LobbyParticipantDto {
  lobbyParticipantId: number;
  lobbyId: number;
  participantEmail: string;
  role: string;
  joinedAt: string;
}

export interface UpdatePrivacyDto {
  isPublic: boolean;
}

export interface UpdateDifficultyDto {
  difficulty: string;
}

// ─── Matches ───────────────────────────────────────────────────────

export interface MatchStartedDto {
  matchId: number;
  problemIds: number[];
  startAtUtc: string;
  durationSec: number;
  sentAtUtc: string;
}

export interface StartMatchRequest {
  problemIds: number[];
  durationSec: number;
  preparationBufferSec?: number;
}

// ─── Submissions ───────────────────────────────────────────────────

export interface SubmissionDto {
  matchId: number;
  problemId: number;
  language: string;
  code: string;
  score?: number;
  status?: string;
}

export interface SubmissionResultDto {
  submissionId: number;
  score: number;
  status: string;
  passedCount: number;
  totalCount: number;
  testCaseResults: TestCaseResultDto[];
  submittedAt: string;
}

export interface TestCaseResultDto {
  testCaseIndex: number;
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  error?: string;
}

// ─── Statistics & Leaderboard ──────────────────────────────────────

export interface UserStatisticsDto {
  email: string;
  fullName: string;
  rank: number;
  matchesPlayed: number;
  winRate: number;
  problemsCompleted: number;
  totalScore: number;
  lastActivity: string | null;
}

export interface LeaderboardEntryDto {
  rank: number;
  participantEmail: string;
  fullName?: string;
  totalScore: number;
  problemsCompleted: number;
  matchesPlayed: number;
  winRate: number;
  lastSubmission: string | null;
}

// ─── Students & Teachers ───────────────────────────────────────────

export interface StudentRequestDto {
  requestId: number;
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface TeacherDto {
  teacherId: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

export interface StudentAnalyticsDto {
  studentId: number;
  studentName: string;
  email: string;
  totalSubmissions: number;
  successfulSubmissions: number;
  successRate: number;
  problemsAttempted: number;
  problemsSolved: number;
  matchesParticipated: number;
  averageScore: number;
  preferredLanguage: string;
  lastActivity: string | null;
}

export interface SubmissionHistoryDto {
  submissionId: number;
  problemTitle: string;
  language: string;
  status: string;
  score: number;
  submittedAt: string;
  difficultyLevel: string;
}

export interface TeacherDashboardStatsDto {
  totalStudents: number;
  activeStudents: number;
  totalSubmissions: number;
  overallSuccessRate: number;
  topPerformers: any[];
}

// ─── Friends ───────────────────────────────────────────────────────

export interface FriendDto {
  studentId: number;
  fullName: string;
  email: string;
  isOnline: boolean;
  friendsSince: string;
}

export interface FriendRequestDto {
  requestId: number;
  senderId: number;
  receiverId: number;
  senderName?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverEmail?: string;
  status: string;
  requestedAt: string;
}

export interface SendFriendRequestDto {
  receiverId: number;
}

// ─── Chat ──────────────────────────────────────────────────────────

export interface ConversationDto {
  conversationId: number;
  type: string;
  referenceId: number | null;
  createdAt: string;
  updatedAt: string;
  participants: string[];
  lastMessage?: MessageDto;
}

export interface MessageDto {
  messageId: number;
  conversationId: number;
  senderEmail: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface SendMessageDto {
  content: string;
}

export interface CreateConversationDto {
  type: string;
  referenceId?: number;
  participantEmails: string[];
}

export interface CreateFriendConversationDto {
  friendId?: number;
  friendEmail?: string;
}

// ─── Admin ─────────────────────────────────────────────────────────

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export interface UserToggleDto {
  deactivate: boolean;
}

// ─── AI Micro-Course ───────────────────────────────────────────────

export interface MicroCourseRequestDto {
  timeLimitSeconds?: number;
  remainingSec?: number;
  language?: string;
}

export interface MicroCourseResponseDto {
  microCourseId?: string;
  summary: string;
  steps: MicroCourseStepDto[];
  disclaimer: string;
}

export interface MicroCourseStepDto {
  title: string;
  durationSec: number;
  content: string;
  example: string;
  resources: string[];
}

// ─── Common ────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  total: number;
}

