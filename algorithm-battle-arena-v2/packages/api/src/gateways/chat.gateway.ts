import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatRepoService } from '../chat/chat-repo.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Port of C# ChatHub (mapped at /chathub in ASP.NET).
 * Socket.IO namespace: /chat
 *
 * Server-to-Client events: NewMessage
 * Client-to-Server events: JoinConversation, LeaveConversation, SendMessage
 */
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [
      'http://localhost:5173', 'http://localhost:4200',
      'http://localhost:3000', 'http://localhost:8000',
    ],
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly nameCache = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatRepo: ChatRepoService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveSenderName(email: string): Promise<string> {
    const cached = this.nameCache.get(email);
    if (cached) return cached;

    const student = await this.prisma.student.findUnique({ where: { email }, select: { firstName: true, lastName: true } });
    if (student) {
      const name = `${student.firstName} ${student.lastName}`;
      this.nameCache.set(email, name);
      return name;
    }
    const teacher = await this.prisma.teacher.findUnique({ where: { email }, select: { firstName: true, lastName: true } });
    if (teacher) {
      const name = `${teacher.firstName} ${teacher.lastName}`;
      this.nameCache.set(email, name);
      return name;
    }
    return email;
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.access_token;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token as string, { algorithms: ['HS512'] });
      client.data.user = payload;
      this.logger.log(`Chat client connected: ${payload.email}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.data?.user?.email || 'unknown'}`);
  }

  @SubscribeMessage('JoinConversation')
  async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    const email = client.data?.user?.email;
    if (!email) return;

    // Verify user is a participant
    const isParticipant = await this.chatRepo.isParticipantAsync(parseInt(conversationId, 10), email);
    if (!isParticipant) return;

    client.join(`conversation_${conversationId}`);
  }

  @SubscribeMessage('LeaveConversation')
  async handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    client.leave(`conversation_${conversationId}`);
  }

  @SubscribeMessage('SendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const email = client.data?.user?.email;
    if (!email) return;

    const conversationId = parseInt(data.conversationId, 10);

    // Verify participant
    const isParticipant = await this.chatRepo.isParticipantAsync(conversationId, email);
    if (!isParticipant) return;

    // Save to DB
    const messageId = await this.chatRepo.sendMessageAsync(conversationId, email, data.content);

    // Build message DTO and broadcast with resolved name
    const senderName = await this.resolveSenderName(email);
    const message = {
      messageId,
      conversationId,
      senderEmail: email,
      senderName,
      content: data.content,
      sentAt: new Date().toISOString(),
    };

    this.server.to(`conversation_${data.conversationId}`).emit('NewMessage', message);
  }

  /** Called from ChatController REST endpoint to broadcast messages. */
  emitNewMessage(conversationId: number, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('NewMessage', message);
  }
}

