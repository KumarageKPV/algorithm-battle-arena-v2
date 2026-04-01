import {
  Controller, Get, Post, Body, Param, Query, UseGuards, Request,
  HttpCode, HttpStatus, Logger, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { ChatRepoService } from './chat-repo.service';
import { AuthRepoService } from '../auth/auth-repo.service';
import { FriendsRepoService } from '../friends/friends-repo.service';
import { TeacherRepoService } from '../teachers/teacher-repo.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto, CreateFriendConversationDto } from './dto/chat.dto';

/**
 * Port of C# ChatController — /api/Chat (4 endpoints).
 */
@Controller('api/Chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatRepo: ChatRepoService,
    private readonly authRepo: AuthRepoService,
    private readonly friendsRepo: FriendsRepoService,
    private readonly teacherRepo: TeacherRepoService,
    private readonly chatGateway: ChatGateway,
    private readonly prisma: PrismaService,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatRepo.getConversationsAsync(req.user.email);
  }

  @Get('conversations/:convId/messages')
  async getMessages(
    @Param('convId') convId: string,
    @Query('pageSize') pageSize?: string,
    @Query('offset') offset?: string,
    @Request() req?: any,
  ) {
    const conversationId = parseInt(convId, 10);
    const userEmail = req?.user?.email;

    // Port of v1: verify caller is a participant before returning messages
    if (userEmail) {
      const isParticipant = await this.chatRepo.isParticipantAsync(conversationId, userEmail);
      if (!isParticipant) {
        throw new ForbiddenException('Not a participant in this conversation');
      }
    }

    return this.chatRepo.getMessagesAsync(
      conversationId,
      parseInt(pageSize || '50', 10),
      parseInt(offset || '0', 10),
    );
  }

  @Post('conversations/:convId/messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Param('convId') convId: string,
    @Body() body: SendMessageDto,
    @Request() req: any,
  ) {
    const conversationId = parseInt(convId, 10);

    if (!body.content || !body.content.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const isParticipant = await this.chatRepo.isParticipantAsync(conversationId, req.user.email);
    if (!isParticipant) throw new ForbiddenException('Not a participant in this conversation');

    const messageId = await this.chatRepo.sendMessageAsync(conversationId, req.user.email, body.content.trim());

    // Resolve sender name and broadcast via Socket.IO
    const senderName = await this.resolveSenderName(req.user.email);
    this.chatGateway.emitNewMessage(conversationId, {
      messageId,
      conversationId,
      senderEmail: req.user.email,
      senderName,
      content: body.content.trim(),
      sentAt: new Date().toISOString(),
    });

    return { MessageId: messageId };
  }

  private async resolveSenderName(email: string): Promise<string> {
    const student = await this.prisma.student.findUnique({ where: { email }, select: { firstName: true, lastName: true } });
    if (student) return `${student.firstName} ${student.lastName}`;
    const teacher = await this.prisma.teacher.findUnique({ where: { email }, select: { firstName: true, lastName: true } });
    if (teacher) return `${teacher.firstName} ${teacher.lastName}`;
    return email;
  }

  @Post('conversations/friend')
  @HttpCode(HttpStatus.OK)
  async createFriendConversation(
    @Body() body: CreateFriendConversationDto,
    @Request() req: any,
  ) {
    const userEmail = req.user.email;
    const userRole = req.user.role;
    let friendEmail = body.friendEmail;

    if (body.friendId && !friendEmail) {
      // Look up friend email from student table
      const friendStudent = await this.prisma.student.findUnique({
        where: { studentId: body.friendId },
      });
      if (friendStudent) {
        friendEmail = friendStudent.email;
      }
    }

    if (!friendEmail) throw new BadRequestException('Friend email is required');

    // Port of v1: Role-based validation
    if (userRole === 'Student') {
      const studentId = req.user.studentId;
      if (!studentId) throw new BadRequestException('Student ID not found');

      // Check if target is a teacher (teachers can chat with any student)
      let isTeacher = false;
      if (body.friendId && body.friendId > 0) {
        isTeacher = await this.teacherRepo.existsAsync(body.friendId);
      }

      if (!isTeacher) {
        // Must be friends with target student
        const friends = await this.friendsRepo.getFriendsAsync(studentId);
        const isFriend = friends.some((f: any) => f.studentId === body.friendId);
        if (!isFriend) {
          throw new BadRequestException('You can only chat with friends');
        }
      }
    }
    // Teachers can chat with any student — no additional validation needed (port of v1)

    // Check if conversation already exists (search both Friend and TeacherStudent types)
    const existingFriend = await this.chatRepo.getFriendConversationAsync(userEmail, friendEmail);
    if (existingFriend) return existingFriend;

    const existingTeacherStudent = await this.chatRepo.getTeacherStudentConversationAsync(userEmail, friendEmail);
    if (existingTeacherStudent) return existingTeacherStudent;

    // Determine conversation type based on roles
    const friendRole = await this.authRepo.getUserRole(friendEmail);
    const type = (userRole === 'Teacher' || friendRole === 'Teacher') ? 'TeacherStudent' : 'Friend';

    const conversationId = await this.chatRepo.createConversationAsync(type, null, [userEmail, friendEmail]);
    return this.chatRepo.getConversationAsync(conversationId);
  }
}

