import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConversationDto {
  conversationId: number;
  type: string;
  referenceId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  participants: string[];
  lastMessage?: any;
}

export interface MessageDto {
  messageId: number;
  conversationId: number;
  senderEmail: string;
  senderName: string;
  content: string;
  sentAt: Date;
}

/**
 * Port of C# ChatRepository — conversation + message management.
 */
@Injectable()
export class ChatRepoService {
  private readonly logger = new Logger(ChatRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createConversationAsync(type: string, referenceId: number | null, participantEmails: string[]): Promise<number> {
    // Check if conversation already exists for lobby/match types
    if (referenceId !== null) {
      const existing = await this.prisma.conversation.findFirst({
        where: { type, referenceId },
      });
      if (existing) {
        await this.addParticipantsToConversationAsync(existing.conversationId, participantEmails);
        return existing.conversationId;
      }
    }

    const conversation = await this.prisma.conversation.create({
      data: { type, referenceId },
    });

    await this.addParticipantsToConversationAsync(conversation.conversationId, participantEmails);
    return conversation.conversationId;
  }

  async addParticipantsToConversationAsync(conversationId: number, participantEmails: string[]): Promise<void> {
    for (const email of participantEmails) {
      try {
        // Idempotent insert — ignore if already exists (unique constraint)
        await this.prisma.conversationParticipant.upsert({
          where: {
            conversationId_participantEmail: { conversationId, participantEmail: email },
          },
          create: { conversationId, participantEmail: email },
          update: {},
        });
      } catch {
        // Ignore duplicate participant errors
      }
    }
  }

  async getConversationsAsync(userEmail: string): Promise<ConversationDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { participantEmail: userEmail } },
      },
      include: {
        participants: { select: { participantEmail: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c: any) => ({
      conversationId: c.conversationId,
      type: c.type,
      referenceId: c.referenceId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      participants: c.participants.map((p: any) => p.participantEmail),
      lastMessage: c.messages[0] ?? null,
    }));
  }

  async getConversationAsync(conversationId: number): Promise<ConversationDto | null> {
    const conv = await this.prisma.conversation.findUnique({
      where: { conversationId },
      include: { participants: { select: { participantEmail: true } } },
    });

    if (!conv) return null;

    return {
      conversationId: conv.conversationId,
      type: conv.type,
      referenceId: conv.referenceId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((p: any) => p.participantEmail),
    };
  }

  async sendMessageAsync(conversationId: number, senderEmail: string, content: string): Promise<number> {
    const message = await this.prisma.message.create({
      data: { conversationId, senderEmail, content },
    });

    await this.prisma.conversation.update({
      where: { conversationId },
      data: { updatedAt: new Date() },
    });

    return message.messageId;
  }

  async getMessagesAsync(conversationId: number, pageSize = 50, offset = 0): Promise<MessageDto[]> {
    // PostgreSQL: COALESCE replaces ISNULL, string_agg replaces STRING_AGG, || replaces +
    const messages = await this.prisma.$queryRaw<MessageDto[]>`
      SELECT m.message_id as "messageId", m.conversation_id as "conversationId",
             m.sender_email as "senderEmail", m.content, m.sent_at as "sentAt",
             COALESCE(s.first_name || ' ' || s.last_name,
                      t.first_name || ' ' || t.last_name, 'Admin') as "senderName"
      FROM messages m
      LEFT JOIN student s ON m.sender_email = s.email
      LEFT JOIN teachers t ON m.sender_email = t.email
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.sent_at DESC
      OFFSET ${offset} LIMIT ${pageSize}
    `;
    return messages;
  }

  async isParticipantAsync(conversationId: number, userEmail: string): Promise<boolean> {
    const count = await this.prisma.conversationParticipant.count({
      where: { conversationId, participantEmail: userEmail },
    });
    return count > 0;
  }

  async getFriendConversationAsync(user1Email: string, user2Email: string): Promise<ConversationDto | null> {
    const conv = await this.prisma.conversation.findFirst({
      where: {
        type: 'Friend',
        referenceId: null,
        AND: [
          { participants: { some: { participantEmail: user1Email } } },
          { participants: { some: { participantEmail: user2Email } } },
        ],
      },
      include: { participants: { select: { participantEmail: true } } },
    });

    if (!conv) return null;

    return {
      conversationId: conv.conversationId,
      type: conv.type,
      referenceId: conv.referenceId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((p: any) => p.participantEmail),
    };
  }

  async getTeacherStudentConversationAsync(user1Email: string, user2Email: string): Promise<ConversationDto | null> {
    const conv = await this.prisma.conversation.findFirst({
      where: {
        type: 'TeacherStudent',
        referenceId: null,
        AND: [
          { participants: { some: { participantEmail: user1Email } } },
          { participants: { some: { participantEmail: user2Email } } },
        ],
      },
      include: { participants: { select: { participantEmail: true } } },
    });

    if (!conv) return null;

    return {
      conversationId: conv.conversationId,
      type: conv.type,
      referenceId: conv.referenceId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((p: any) => p.participantEmail),
    };
  }

  async getLobbyConversationAsync(lobbyId: number): Promise<ConversationDto | null> {
    return this.getConversationByTypeAndRef('Lobby', lobbyId);
  }

  async getMatchConversationAsync(matchId: number): Promise<ConversationDto | null> {
    return this.getConversationByTypeAndRef('Match', matchId);
  }

  private async getConversationByTypeAndRef(type: string, referenceId: number): Promise<ConversationDto | null> {
    const conv = await this.prisma.conversation.findFirst({
      where: { type, referenceId },
      include: { participants: { select: { participantEmail: true } } },
    });

    if (!conv) return null;

    return {
      conversationId: conv.conversationId,
      type: conv.type,
      referenceId: conv.referenceId,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((p: any) => p.participantEmail),
    };
  }
}





