import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Port of C# LobbyRepository — all 10 methods.
 */
@Injectable()
export class LobbyRepoService {
  private readonly logger = new Logger(LobbyRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLobby(
    lobbyName: string, maxPlayers: number, mode: string,
    difficulty: string, hostEmail: string, lobbyCode: string,
  ) {
    const lobby = await this.prisma.lobby.create({
      data: {
        lobbyName, maxPlayers, mode, difficulty,
        hostEmail, lobbyCode, status: 'Open', isPublic: true,
      },
    });

    await this.prisma.lobbyParticipant.create({
      data: {
        lobbyId: lobby.lobbyId, participantEmail: hostEmail, role: 'Host',
      },
    });

    return this.getLobbyById(lobby.lobbyId);
  }

  async joinLobby(lobbyId: number, participantEmail: string): Promise<boolean> {
    const lobby = await this.getLobbyById(lobbyId);
    if (!lobby || lobby.status !== 'Open') return false;
    if (lobby.participants.length >= lobby.maxPlayers) return false;
    if (lobby.participants.some((p: any) => p.participantEmail === participantEmail)) return false;

    await this.prisma.lobbyParticipant.create({
      data: { lobbyId, participantEmail, role: 'Player' },
    });
    return true;
  }

  async leaveLobby(lobbyId: number, participantEmail: string): Promise<boolean> {
    const result = await this.prisma.lobbyParticipant.deleteMany({
      where: { lobbyId, participantEmail },
    });
    return result.count > 0;
  }

  async kickParticipant(lobbyId: number, hostEmail: string, participantEmail: string): Promise<boolean> {
    if (!(await this.isHost(lobbyId, hostEmail))) return false;
    return this.leaveLobby(lobbyId, participantEmail);
  }

  async closeLobby(lobbyId: number, hostEmail: string): Promise<boolean> {
    if (!(await this.isHost(lobbyId, hostEmail))) return false;
    return this.updateLobbyStatus(lobbyId, 'Closed');
  }

  async updateLobbyStatus(lobbyId: number, status: string): Promise<boolean> {
    try {
      await this.prisma.lobby.update({ where: { lobbyId }, data: { status } });
      return true;
    } catch { return false; }
  }

  async updateLobbyPrivacy(lobbyId: number, isPublic: boolean): Promise<boolean> {
    try {
      await this.prisma.lobby.update({ where: { lobbyId }, data: { isPublic } });
      return true;
    } catch { return false; }
  }

  async updateLobbyDifficulty(lobbyId: number, difficulty: string): Promise<boolean> {
    try {
      await this.prisma.lobby.update({ where: { lobbyId }, data: { difficulty } });
      return true;
    } catch { return false; }
  }

  async deleteLobby(lobbyId: number): Promise<boolean> {
    try {
      await this.prisma.lobby.delete({ where: { lobbyId } });
      return true;
    } catch { return false; }
  }

  async getOpenLobbies() {
    return this.prisma.lobby.findMany({
      where: { status: 'Open', isPublic: true },
      include: { participants: true },
    });
  }

  async getLobbyById(lobbyId: number) {
    return this.prisma.lobby.findUnique({
      where: { lobbyId },
      include: { participants: true },
    });
  }

  async getLobbyByCode(lobbyCode: string) {
    return this.prisma.lobby.findUnique({
      where: { lobbyCode },
      include: { participants: true },
    });
  }

  async isHost(lobbyId: number, email: string): Promise<boolean> {
    const lobby = await this.prisma.lobby.findUnique({
      where: { lobbyId },
      select: { hostEmail: true },
    });
    return lobby?.hostEmail === email;
  }
}



