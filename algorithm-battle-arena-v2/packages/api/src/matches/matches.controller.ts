import {
  Controller, Get, Post, Body, Param, UseGuards, Request,
  HttpCode, HttpStatus, Logger, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard, StudentOrAdminGuard } from '../auth/guards';
import { MatchRepoService } from './match-repo.service';
import { LobbyRepoService } from '../lobbies/lobby-repo.service';
import { ChatRepoService } from '../chat/chat-repo.service';
import { LobbyGateway } from '../gateways/lobby.gateway';
import { StartMatchRequestDto } from './dto/matches.dto';

export interface MatchStartedDto {
  matchId: number;
  problemIds: number[];
  startAtUtc: string;
  durationSec: number;
  sentAtUtc: string;
}

/**
 * Port of C# MatchesController — /api/Matches (3 endpoints).
 */
@Controller('api/Matches')
export class MatchesController {
  private readonly logger = new Logger(MatchesController.name);

  constructor(
    private readonly matchRepo: MatchRepoService,
    private readonly lobbyRepo: LobbyRepoService,
    private readonly chatRepo: ChatRepoService,
    private readonly lobbyGateway: LobbyGateway,
  ) {}

  @UseGuards(JwtAuthGuard, StudentOrAdminGuard)
  @Post(':lobbyId/start')
  @HttpCode(HttpStatus.OK)
  async startMatch(@Param('lobbyId') lobbyId: string, @Body() body: StartMatchRequestDto, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can start the match.');

    const match = await this.matchRepo.createMatch(lid, body.problemIds);

    // Update lobby status to InProgress
    await this.lobbyRepo.updateLobbyStatus(lid, 'InProgress');

    // Create match chat conversation
    const lobby = await this.lobbyRepo.getLobbyById(lid);
    if (lobby) {
      const participantEmails = lobby.participants.map((p: any) => p.participantEmail);
      await this.chatRepo.createConversationAsync('Match', match.matchId, participantEmails);
    }

    const bufferSec = body.preparationBufferSec ?? 5;
    const startAtUtc = new Date(Date.now() + bufferSec * 1000).toISOString();

    const dto: MatchStartedDto = {
      matchId: match.matchId,
      problemIds: body.problemIds,
      startAtUtc,
      durationSec: body.durationSec,
      sentAtUtc: new Date().toISOString(),
    };

    // TODO: Broadcast MatchStarted via Socket.IO gateway to lobby group
    this.lobbyGateway.emitMatchStarted(lid, dto);

    return dto;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':matchId/leaderboard')
  async getMatchLeaderboard(@Param('matchId') matchId: string) {
    return this.matchRepo.getMatchLeaderboard(parseInt(matchId, 10));
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard/global')
  async getGlobalLeaderboard() {
    return this.matchRepo.getGlobalLeaderboard();
  }
}


