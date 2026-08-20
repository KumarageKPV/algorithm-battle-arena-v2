import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Port of C# FriendsRepository.
 */
@Injectable()
export class FriendsRepoService {
  private readonly logger = new Logger(FriendsRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getFriendsAsync(studentId: number) {
    const friendships = await this.prisma.friend.findMany({
      where: {
        OR: [{ studentId1: studentId }, { studentId2: studentId }],
      },
      include: {
        student1: true,
        student2: true,
      },
    });

    return friendships.map((f: any) => {
      const friend = f.studentId1 === studentId ? f.student2 : f.student1;
      return {
        studentId: friend.studentId,
        fullName: `${friend.firstName} ${friend.lastName}`,
        email: friend.email,
        isOnline: false,
        friendsSince: f.createdAt,
      };
    });
  }

  async searchStudentsAsync(query: string, currentStudentId: number) {
    return this.prisma.student.findMany({
      where: {
        studentId: { not: currentStudentId },
        active: true,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }

  async sendFriendRequestAsync(senderId: number, receiverId: number): Promise<number> {
    const request = await this.prisma.friendRequest.create({
      data: { senderId, receiverId, status: 'Pending' },
    });
    return request.requestId;
  }

  async getReceivedRequestsAsync(studentId: number) {
    return this.prisma.friendRequest.findMany({
      where: { receiverId: studentId, status: 'Pending' },
      include: { sender: true, receiver: true },
    });
  }

  async getSentRequestsAsync(studentId: number) {
    return this.prisma.friendRequest.findMany({
      where: { senderId: studentId },
      include: { sender: true, receiver: true },
    });
  }

  async getFriendRequestAsync(requestId: number) {
    return this.prisma.friendRequest.findUnique({
      where: { requestId },
      include: { sender: true, receiver: true },
    });
  }

  async acceptFriendRequestAsync(requestId: number, studentId: number): Promise<boolean> {
    const request = await this.prisma.friendRequest.findUnique({ where: { requestId } });
    if (!request || request.receiverId !== studentId || request.status !== 'Pending') return false;

    await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { requestId },
        data: { status: 'Accepted', respondedAt: new Date() },
      }),
      this.prisma.friend.create({
        data: {
          studentId1: Math.min(request.senderId, request.receiverId),
          studentId2: Math.max(request.senderId, request.receiverId),
        },
      }),
    ]);

    return true;
  }

  async rejectFriendRequestAsync(requestId: number, studentId: number): Promise<boolean> {
    const request = await this.prisma.friendRequest.findUnique({ where: { requestId } });
    if (!request || request.receiverId !== studentId || request.status !== 'Pending') return false;

    await this.prisma.friendRequest.update({
      where: { requestId },
      data: { status: 'Rejected', respondedAt: new Date() },
    });
    return true;
  }

  async removeFriendAsync(studentId: number, friendId: number): Promise<boolean> {
    const result = await this.prisma.friend.deleteMany({
      where: {
        OR: [
          { studentId1: studentId, studentId2: friendId },
          { studentId1: friendId, studentId2: studentId },
        ],
      },
    });
    return result.count > 0;
  }

  async getFriendRequestEmailsAsync(requestId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { requestId },
      include: { sender: true, receiver: true },
    });
    if (!request) return null;
    return { senderEmail: request.sender.email, receiverEmail: request.receiver.email };
  }
}


