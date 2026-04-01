import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// ─── Core Modules ──────────────────────────────────────────────────
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

// ─── Middleware ─────────────────────────────────────────────────────
import { AuditLoggingMiddleware } from './middleware/audit-logging.middleware';

// ─── Repository Services ───────────────────────────────────────────
import { ProblemRepoService } from './problems/problem-repo.service';
import { LobbyRepoService } from './lobbies/lobby-repo.service';
import { MatchRepoService } from './matches/match-repo.service';
import { SubmissionRepoService } from './submissions/submission-repo.service';
import { ChatRepoService } from './chat/chat-repo.service';
import { FriendsRepoService } from './friends/friends-repo.service';
import { StudentRepoService } from './students/student-repo.service';
import { TeacherRepoService } from './teachers/teacher-repo.service';
import { StatisticsRepoService } from './statistics/statistics-repo.service';
import { AdminRepoService } from './admin/admin-repo.service';

// ─── Controllers ───────────────────────────────────────────────────
import { ProblemsController } from './problems/problems.controller';
import { LobbiesController } from './lobbies/lobbies.controller';
import { MatchesController } from './matches/matches.controller';
import { SubmissionsController } from './submissions/submissions.controller';
import { ChatController } from './chat/chat.controller';
import { FriendsController } from './friends/friends.controller';
import { StudentsController } from './students/students.controller';
import { TeachersController } from './teachers/teachers.controller';
import { StatisticsController } from './statistics/statistics.controller';
import { AdminController } from './admin/admin.controller';
import { CodeExecutionController } from './code-execution/code-execution.controller';

// ─── Gateways (Socket.IO) ─────────────────────────────────────────
import { LobbyGateway } from './gateways/lobby.gateway';
import { ChatGateway } from './gateways/chat.gateway';

// ─── Services ──────────────────────────────────────────────────────
import { MicroCourseService } from './micro-course/micro-course.service';
import { CodeExecutionService } from './code-execution/code-execution.service';

@Module({
  imports: [
    // Global config — reads from process.env (Docker, .env, etc.)
    ConfigModule.forRoot({ isGlobal: true }),

    // Prisma (global)
    PrismaModule,

    // Auth (exports AuthService, guards, etc.)
    AuthModule,
  ],
  controllers: [
    ProblemsController,
    LobbiesController,
    MatchesController,
    SubmissionsController,
    ChatController,
    FriendsController,
    StudentsController,
    TeachersController,
    StatisticsController,
    AdminController,
    CodeExecutionController,
  ],
  providers: [
    // Repository services (12)
    ProblemRepoService,
    LobbyRepoService,
    MatchRepoService,
    SubmissionRepoService,
    ChatRepoService,
    FriendsRepoService,
    StudentRepoService,
    TeacherRepoService,
    StatisticsRepoService,
    AdminRepoService,

    // Gateways (2)
    LobbyGateway,
    ChatGateway,

    // Business services
    MicroCourseService,
    CodeExecutionService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply audit logging middleware to all routes
    // (it internally filters to only audit PUT/POST/DELETE on /admin and /users/ paths)
    consumer.apply(AuditLoggingMiddleware).forRoutes('*');
  }
}

