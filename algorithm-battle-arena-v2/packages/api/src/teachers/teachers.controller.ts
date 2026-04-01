import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { TeacherRepoService } from './teacher-repo.service';

/** Port of C# TeachersController — /api/Teachers (1 endpoint). */
@Controller('api/Teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teacherRepo: TeacherRepoService) {}

  @Get()
  async getTeachers() {
    return this.teacherRepo.getTeachers();
  }
}

