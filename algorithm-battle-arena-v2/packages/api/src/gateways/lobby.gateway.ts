import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LobbyRepoService } from '../lobbies/lobby-repo.service';

/**
 * Port of C# MatchHub (mapped at /lobbyHub in ASP.NET).
 * Socket.IO namespace: /lobby
 *
 * Server-to-Client events: LobbyUpdated, MatchStarted, LobbyDeleted
 * Client-to-Server events: JoinLobby, LeaveLobby
 */
@WebSocketGateway({
  namespace: '/lobby',
  cors: {
    origin: [
      'http://localhost:5173', 'http://localhost:4200',
      'http://localhost:3000', 'http://localhost:8000',
    ],
    credentials: true,
  },
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(LobbyGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly lobbyRepo: LobbyRepoService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.access_token;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token as string, { algorithms: ['HS512'] });
      client.data.user = payload;
      this.logger.log(`Client connected: ${payload.email}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data?.user?.email || 'unknown'}`);
  }

  @SubscribeMessage('JoinLobby')
  async handleJoinLobby(@ConnectedSocket() client: Socket, @MessageBody() lobbyId: string) {
    client.join(lobbyId);
    const lobby = await this.lobbyRepo.getLobbyById(parseInt(lobbyId, 10));
    if (lobby) {
      this.server.to(lobbyId).emit('LobbyUpdated', lobby);
    }
  }

  @SubscribeMessage('LeaveLobby')
  async handleLeaveLobby(@ConnectedSocket() client: Socket, @MessageBody() lobbyId: string) {
    client.leave(lobbyId);
    const lobby = await this.lobbyRepo.getLobbyById(parseInt(lobbyId, 10));
    if (lobby) {
      this.server.to(lobbyId).emit('LobbyUpdated', lobby);
    }
  }

  /** Called from controllers to broadcast lobby state changes. */
  emitLobbyUpdated(lobbyId: number, lobbyData: any) {
    this.server.to(String(lobbyId)).emit('LobbyUpdated', lobbyData);
  }

  /** Called from MatchesController when host starts a match. */
  emitMatchStarted(lobbyId: number, matchData: any) {
    this.server.to(String(lobbyId)).emit('MatchStarted', matchData);
  }

  /** Called from LobbiesController when host deletes lobby. */
  emitLobbyDeleted(lobbyId: number) {
    this.server.to(String(lobbyId)).emit('LobbyDeleted');
  }
}

