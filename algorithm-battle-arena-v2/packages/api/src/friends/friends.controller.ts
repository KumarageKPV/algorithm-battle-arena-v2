import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard, StudentGuard } from '../auth/guards';
import { FriendsRepoService } from './friends-repo.service';
import { ChatRepoService } from '../chat/chat-repo.service';
import { SendFriendRequestDto } from './dto/friends.dto';

/**
 * Port of C# FriendsController — /api/Friends (8 endpoints).
 * All endpoints require Student role.
 */
@Controller('api/Friends')
@UseGuards(JwtAuthGuard, StudentGuard)
export class FriendsController {
  constructor(
    private readonly friendsRepo: FriendsRepoService,
    private readonly chatRepo: ChatRepoService,
  ) {}

  @Get()
  async getFriends(@Request() req: any) {
    const studentId = req.user.studentId;
    return this.friendsRepo.getFriendsAsync(studentId);
  }

  @Get('search')
  async searchStudents(@Query('query') query: string, @Request() req: any) {
    return this.friendsRepo.searchStudentsAsync(query || '', req.user.studentId);
  }

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async sendFriendRequest(@Body() body: SendFriendRequestDto, @Request() req: any) {
    if (req.user.studentId === body.receiverId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }
    const requestId = await this.friendsRepo.sendFriendRequestAsync(req.user.studentId, body.receiverId);
    return { RequestId: requestId, Message: 'Friend request sent' };
  }

  @Get('requests/received')
  async getReceivedRequests(@Request() req: any) {
    return this.friendsRepo.getReceivedRequestsAsync(req.user.studentId);
  }

  @Get('requests/sent')
  async getSentRequests(@Request() req: any) {
    return this.friendsRepo.getSentRequestsAsync(req.user.studentId);
  }

  @Put('requests/:requestId/accept')
  async acceptFriendRequest(@Param('requestId') requestId: string, @Request() req: any) {
    const success = await this.friendsRepo.acceptFriendRequestAsync(parseInt(requestId, 10), req.user.studentId);
    if (!success) throw new BadRequestException('Failed to accept friend request');

    // Auto-create Friend chat conversation
    const emails = await this.friendsRepo.getFriendRequestEmailsAsync(parseInt(requestId, 10));
    if (emails) {
      await this.chatRepo.createConversationAsync('Friend', null, [emails.senderEmail, emails.receiverEmail]);
    }

    return { Message: 'Friend request accepted' };
  }

  @Put('requests/:requestId/reject')
  async rejectFriendRequest(@Param('requestId') requestId: string, @Request() req: any) {
    const success = await this.friendsRepo.rejectFriendRequestAsync(parseInt(requestId, 10), req.user.studentId);
    if (!success) throw new BadRequestException('Failed to reject friend request');
    return { Message: 'Friend request rejected' };
  }

  @Delete(':friendId')
  async removeFriend(@Param('friendId') friendId: string, @Request() req: any) {
    const success = await this.friendsRepo.removeFriendAsync(req.user.studentId, parseInt(friendId, 10));
    if (!success) throw new BadRequestException('Failed to remove friend');
    return { Message: 'Friend removed' };
  }
}

