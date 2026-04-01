import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { StudentRepoService } from './student-repo.service';
import { AuthService } from '../auth/auth.service';
import { StudentRequestDto } from './dto/students.dto';

/**
 * Port of C# StudentsController — /api/Students (8 endpoints).
 * Role-checking done in handler (Student for some, Teacher for others).
 */
@Controller('api/Students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(
    private readonly studentRepo: StudentRepoService,
    private readonly authService: AuthService,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async createRequest(@Body() body: StudentRequestDto, @Request() req: any) {
    if (req.user.role !== 'Student') throw new BadRequestException('Only students can request teachers');
    const requestId = await this.studentRepo.createRequest(req.user.studentId, body.teacherId);
    return { RequestId: requestId };
  }

  @Put(':requestId/accept')
  async acceptRequest(@Param('requestId') requestId: string, @Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can accept requests');
    const success = await this.studentRepo.acceptRequest(parseInt(requestId, 10), req.user.teacherId);
    if (!success) throw new BadRequestException('Failed to accept request');
    return;
  }

  @Put(':requestId/reject')
  async rejectRequest(@Param('requestId') requestId: string, @Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can reject requests');
    const success = await this.studentRepo.rejectRequest(parseInt(requestId, 10), req.user.teacherId);
    if (!success) throw new BadRequestException('Failed to reject request');
    return;
  }

  @Get()
  async getStudentsByStatus(@Query('status') status: string, @Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can view students');
    return this.studentRepo.getStudentsByStatus(req.user.teacherId, status || 'Pending');
  }

  @Get('teachers')
  async getAcceptedTeachers(@Request() req: any) {
    if (req.user.role !== 'Student') throw new BadRequestException('Only students can view teachers');
    return this.studentRepo.getAcceptedTeachers(req.user.studentId);
  }

  @Get(':studentId/analytics')
  async getStudentAnalytics(@Param('studentId') studentId: string, @Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can view analytics');
    return this.studentRepo.getStudentAnalytics(req.user.teacherId, parseInt(studentId, 10));
  }

  @Get(':studentId/submissions')
  async getStudentSubmissions(@Param('studentId') studentId: string, @Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can view submissions');
    return this.studentRepo.getStudentSubmissionHistory(req.user.teacherId, parseInt(studentId, 10));
  }

  @Get('dashboard-stats')
  async getDashboardStats(@Request() req: any) {
    if (req.user.role !== 'Teacher') throw new BadRequestException('Only teachers can view dashboard stats');
    return this.studentRepo.getTeacherDashboardStats(req.user.teacherId);
  }
}

