import {
  Controller, Get, Post, Delete, Put, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus, Logger,
  BadRequestException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard, StudentOrAdminGuard } from '../auth/guards';
import { LobbyRepoService } from './lobby-repo.service';
import { ChatRepoService } from '../chat/chat-repo.service';
import { LobbyGateway } from '../gateways/lobby.gateway';
import { LobbyCreateDto, UpdatePrivacyDto, UpdateDifficultyDto } from './dto/lobbies.dto';

/**
 * Port of C# LobbiesController — /api/Lobbies (10 endpoints).
 * All endpoints require StudentOrAdmin.
 */
@Controller('api/Lobbies')
@UseGuards(JwtAuthGuard, StudentOrAdminGuard)
export class LobbiesController {
  private readonly logger = new Logger(LobbiesController.name);

  constructor(
    private readonly lobbyRepo: LobbyRepoService,
    private readonly chatRepo: ChatRepoService,
    private readonly lobbyGateway: LobbyGateway,
  ) {}

  @Get()
  async getOpenLobbies() {
    return this.lobbyRepo.getOpenLobbies();
  }

  @Get(':lobbyId')
  async getLobbyById(@Param('lobbyId') lobbyId: string) {
    const lobby = await this.lobbyRepo.getLobbyById(parseInt(lobbyId, 10));
    if (!lobby) throw new NotFoundException('Lobby not found');
    return lobby;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLobby(@Body() body: LobbyCreateDto, @Request() req: any) {
    const lobbyCode = this.generateLobbyCode();
    const lobby = await this.lobbyRepo.createLobby(
      body.name, body.maxPlayers ?? 10, body.mode ?? '1v1',
      body.difficulty ?? 'Medium', req.user.email, lobbyCode,
    );

    // Auto-create lobby chat conversation
    if (lobby) {
      try {
        await this.chatRepo.createConversationAsync('Lobby', lobby.lobbyId, [req.user.email]);
      } catch (chatEx) {
        // Log but don't fail lobby creation if chat fails (port of v1)
        this.logger.warn(`Failed to create lobby chat: ${(chatEx as Error).message}`);
      }
    }

    return lobby;
  }

  @Post(':lobbyCode/join')
  @HttpCode(HttpStatus.OK)
  async joinLobby(@Param('lobbyCode') lobbyCode: string, @Request() req: any) {
    const lobby = await this.lobbyRepo.getLobbyByCode(lobbyCode);
    if (!lobby) throw new NotFoundException('Lobby not found');

    const success = await this.lobbyRepo.joinLobby(lobby.lobbyId, req.user.email);
    if (!success) throw new BadRequestException('Cannot join lobby. It might be full or closed.');

    // Add user to lobby conversation
    await this.chatRepo.createConversationAsync('Lobby', lobby.lobbyId, [req.user.email]);

    const updatedLobby = await this.lobbyRepo.getLobbyById(lobby.lobbyId);
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(lobby.lobbyId, updatedLobby);
    return updatedLobby;
  }

  @Post(':lobbyId/leave')
  @HttpCode(HttpStatus.OK)
  async leaveLobby(@Param('lobbyId') lobbyId: string, @Request() req: any) {
    const success = await this.lobbyRepo.leaveLobby(parseInt(lobbyId, 10), req.user.email);
    if (!success) throw new BadRequestException('Cannot leave lobby');
    const updatedLobby = await this.lobbyRepo.getLobbyById(parseInt(lobbyId, 10));
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(parseInt(lobbyId, 10), updatedLobby);
    return { message: 'Left lobby successfully' };
  }

  @Post(':lobbyId/close')
  @HttpCode(HttpStatus.OK)
  async closeLobby(@Param('lobbyId') lobbyId: string, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can close the lobby.');

    const success = await this.lobbyRepo.closeLobby(lid, req.user.email);
    if (!success) throw new BadRequestException('Failed to close lobby');
    const updatedLobby = await this.lobbyRepo.getLobbyById(lid);
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(lid, updatedLobby);
    return { message: 'Lobby closed successfully' };
  }

  @Delete(':lobbyId/participants/:email')
  async kickParticipant(@Param('lobbyId') lobbyId: string, @Param('email') email: string, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can kick participants.');

    const success = await this.lobbyRepo.kickParticipant(lid, req.user.email, email);
    if (!success) throw new BadRequestException('Failed to kick participant');
    const updatedLobby = await this.lobbyRepo.getLobbyById(lid);
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(lid, updatedLobby);
    return { message: 'Participant kicked successfully' };
  }

  @Put(':lobbyId/privacy')
  async updatePrivacy(@Param('lobbyId') lobbyId: string, @Body() body: UpdatePrivacyDto, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    // Port of v1: only the host can change privacy
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can change the lobby privacy.');

    const success = await this.lobbyRepo.updateLobbyPrivacy(lid, body.isPublic);
    if (!success) throw new BadRequestException('Failed to update privacy');
    const updatedLobby = await this.lobbyRepo.getLobbyById(lid);
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(lid, updatedLobby);
    return { message: 'Lobby privacy updated successfully' };
  }

  @Put(':lobbyId/difficulty')
  async updateDifficulty(@Param('lobbyId') lobbyId: string, @Body() body: UpdateDifficultyDto, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    // Port of v1: only the host can change difficulty
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can change the lobby difficulty.');

    const success = await this.lobbyRepo.updateLobbyDifficulty(lid, body.difficulty);
    if (!success) throw new BadRequestException('Failed to update difficulty');
    const updatedLobby = await this.lobbyRepo.getLobbyById(lid);
    if (updatedLobby) this.lobbyGateway.emitLobbyUpdated(lid, updatedLobby);
    return { message: 'Lobby difficulty updated successfully' };
  }

  @Delete(':lobbyId')
  async deleteLobby(@Param('lobbyId') lobbyId: string, @Request() req: any) {
    const lid = parseInt(lobbyId, 10);
    // Port of v1: only the host can delete the lobby
    const isHost = await this.lobbyRepo.isHost(lid, req.user.email);
    if (!isHost) throw new ForbiddenException('Only the host can delete the lobby.');

    this.lobbyGateway.emitLobbyDeleted(lid);
    const success = await this.lobbyRepo.deleteLobby(lid);
    if (!success) throw new BadRequestException('Failed to delete lobby');
    return { message: 'Lobby deleted successfully' };
  }

  private generateLobbyCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

