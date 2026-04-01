import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Port of C# StudentRepository — student-teacher requests + analytics.
 */
@Injectable()
export class StudentRepoService {
  private readonly logger = new Logger(StudentRepoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(studentId: number, teacherId: number): Promise<number> {
    const request = await this.prisma.studentTeacherRequest.create({
      data: { studentId, teacherId, status: 'Pending' },
    });
    return request.requestId;
  }

  async acceptRequest(requestId: number, teacherId: number): Promise<boolean> {
    const request = await this.prisma.studentTeacherRequest.findUnique({ where: { requestId } });
    if (!request || request.teacherId !== teacherId || request.status !== 'Pending') return false;

    await this.prisma.$transaction([
      this.prisma.studentTeacherRequest.update({
        where: { requestId },
        data: { status: 'Accepted' },
      }),
      this.prisma.student.update({
        where: { studentId: request.studentId },
        data: { teacherId },
      }),
    ]);
    return true;
  }

  async rejectRequest(requestId: number, teacherId: number): Promise<boolean> {
    const request = await this.prisma.studentTeacherRequest.findUnique({ where: { requestId } });
    if (!request || request.teacherId !== teacherId || request.status !== 'Pending') return false;

    await this.prisma.studentTeacherRequest.update({
      where: { requestId },
      data: { status: 'Rejected' },
    });
    return true;
  }

  async getStudentsByStatus(teacherId: number, status: string) {
    const requests = await this.prisma.studentTeacherRequest.findMany({
      where: { teacherId, status },
      include: { student: true },
    });

    return requests.map((r: any) => ({
      requestId: r.requestId,
      studentId: r.student.studentId,
      firstName: r.student.firstName,
      lastName: r.student.lastName,
      email: r.student.email,
      username: r.student.email,
    }));
  }

  async getAcceptedTeachers(studentId: number) {
    const requests = await this.prisma.studentTeacherRequest.findMany({
      where: { studentId, status: 'Accepted' },
      include: { teacher: true },
    });

    return requests.map((r: any) => ({
      teacherId: r.teacher.teacherId,
      firstName: r.teacher.firstName,
      lastName: r.teacher.lastName,
      email: r.teacher.email,
      fullName: `${r.teacher.firstName} ${r.teacher.lastName}`,
    }));
  }

  async getStudentAnalytics(teacherId: number, studentId: number) {
    // Verify teacher-student relationship
    const relationship = await this.prisma.studentTeacherRequest.findFirst({
      where: { teacherId, studentId, status: 'Accepted' },
    });
    if (!relationship) return null;

    const student = await this.prisma.student.findUnique({ where: { studentId } });
    if (!student) return null;

    // Complex analytics aggregation via raw SQL (PostgreSQL version)
    const stats = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) as "totalSubmissions",
        COUNT(CASE WHEN score >= 70 THEN 1 END) as "successfulSubmissions",
        CASE WHEN COUNT(*) > 0
          THEN COUNT(CASE WHEN score >= 70 THEN 1 END) * 100.0 / COUNT(*)
          ELSE 0 END as "successRate",
        COUNT(DISTINCT problem_id) as "problemsAttempted",
        COUNT(DISTINCT CASE WHEN score >= 70 THEN problem_id END) as "problemsSolved",
        COUNT(DISTINCT match_id) as "matchesParticipated",
        COALESCE(AVG(CAST(score as FLOAT)), 0) as "averageScore",
        MAX(submitted_at) as "lastActivity"
      FROM submissions
      WHERE participant_email = ${student.email}
    `;

    // Preferred language
    const langStats = await this.prisma.$queryRaw<any[]>`
      SELECT language, COUNT(*) as cnt FROM submissions
      WHERE participant_email = ${student.email}
      GROUP BY language ORDER BY cnt DESC LIMIT 1
    `;

    const s = stats[0] || {};
    return {
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      totalSubmissions: Number(s.totalSubmissions) || 0,
      successfulSubmissions: Number(s.successfulSubmissions) || 0,
      successRate: Number(s.successRate) || 0,
      problemsAttempted: Number(s.problemsAttempted) || 0,
      problemsSolved: Number(s.problemsSolved) || 0,
      matchesParticipated: Number(s.matchesParticipated) || 0,
      averageScore: Number(s.averageScore) || 0,
      preferredLanguage: langStats[0]?.language || 'N/A',
      lastActivity: s.lastActivity || null,
    };
  }

  async getStudentSubmissionHistory(teacherId: number, studentId: number) {
    const student = await this.prisma.student.findUnique({ where: { studentId } });
    if (!student) return [];

    return this.prisma.$queryRaw<any[]>`
      SELECT s.submission_id as "submissionId", p.title as "problemTitle",
             s.language, s.status, s.score, s.submitted_at as "submittedAt",
             p.difficulty_level as "difficultyLevel"
      FROM submissions s
      JOIN problems p ON s.problem_id = p.problem_id
      WHERE s.participant_email = ${student.email}
      ORDER BY s.submitted_at DESC
    `;
  }

  async getTeacherDashboardStats(teacherId: number) {
    const students = await this.prisma.student.findMany({
      where: { teacherId },
    });

    const studentEmails = students.map((s: any) => s.email);
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => s.active).length;

    if (studentEmails.length === 0) {
      return {
        totalStudents, activeStudents, totalSubmissions: 0,
        overallSuccessRate: 0, topPerformers: [],
      };
    }

    const stats = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) as "totalSubmissions",
        CASE WHEN COUNT(*) > 0
          THEN COUNT(CASE WHEN score >= 70 THEN 1 END) * 100.0 / COUNT(*)
          ELSE 0 END as "overallSuccessRate"
      FROM submissions
      WHERE participant_email = ANY(${studentEmails})
    `;

    const s = stats[0] || {};
    return {
      totalStudents,
      activeStudents,
      totalSubmissions: Number(s.totalSubmissions) || 0,
      overallSuccessRate: Number(s.overallSuccessRate) || 0,
      topPerformers: [],
    };
  }
}



