import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Port of C# TeacherRepository — 2 methods only. */
@Injectable()
export class TeacherRepoService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeachers() {
    return this.prisma.teacher.findMany({
      where: { active: true },
    });
  }

  async existsAsync(teacherId: number): Promise<boolean> {
    const count = await this.prisma.teacher.count({ where: { teacherId } });
    return count > 0;
  }
}

