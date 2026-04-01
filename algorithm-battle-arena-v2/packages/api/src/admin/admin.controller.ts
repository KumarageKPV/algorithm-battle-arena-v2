import {
  Controller, Get, Post, Put, Body, Param, Query, Req,
  UseGuards, UseInterceptors, HttpCode, HttpStatus, Logger,
  BadRequestException, PayloadTooLargeException, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { parse } from 'csv-parse/sync';
import 'multer'; // Multer types for Express.Multer.File
import { JwtAuthGuard, AdminGuard } from '../auth/guards';
import { AdminRepoService } from './admin-repo.service';
import { UserToggleDto, ImportedProblemDto } from './dto/admin.dto';

/** Port of C# AdminController — /api/Admin (3 endpoints). */
@Controller('api/Admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminRepo: AdminRepoService) {}

  @Get('users')
  async getUsers(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminRepo.getUsersAsync(
      q, role,
      parseInt(page || '1', 10),
      parseInt(pageSize || '25', 10),
    );
  }

  @Put('users/:id/deactivate')
  async toggleUserActive(@Param('id') id: string, @Body() body: UserToggleDto) {
    const user = await this.adminRepo.toggleUserActiveAsync(id, body.deactivate);
    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  /**
   * Port of C# ImportProblems — supports JSON body, or multipart file upload (JSON/CSV).
   * Mirrors the v1 correlation-id header, 10 MB limit, and 1000-row cap.
   */
  @Post('problems/import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async importProblems(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: Request,
  ) {
    const correlationId =
      (req?.headers?.['x-correlation-id'] as string) || crypto.randomUUID();

    try {
      let problems: ImportedProblemDto[];

      if (file) {
        // File upload path (multipart/form-data)
        if (file.size > 10 * 1024 * 1024) {
          throw new PayloadTooLargeException('File too large');
        }
        problems = this.parseFile(file);
      } else {
        // Raw JSON body path
        const arr = Array.isArray(body) ? body : body?.problems;
        if (!arr || !Array.isArray(arr)) {
          throw new BadRequestException('Expected an array of problems');
        }
        problems = arr;
      }

      if (problems.length > 1000) {
        throw new PayloadTooLargeException('Too many rows. Maximum 1000 allowed.');
      }

      const result = await this.adminRepo.importProblemsAsync(problems);
      this.logger.log(`Imported ${result.inserted} problems. CorrelationId: ${correlationId}`);
      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof PayloadTooLargeException
      ) {
        throw error;
      }
      // ImportException is already an HttpException and will propagate
      if (error instanceof Error && 'errors' in error) throw error;
      this.logger.error(`Error importing problems. CorrelationId: ${correlationId}`, error);
      throw error;
    }
  }

  private parseFile(file: Express.Multer.File): ImportedProblemDto[] {
    const content = file.buffer.toString('utf-8');
    const ext = (file.originalname || '').split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'json':
        return JSON.parse(content);
      case 'csv':
        return parse(content, {
          columns: true,
          skip_empty_lines: true,
          cast: true,
        });
      default:
        throw new BadRequestException(`Unsupported file format: .${ext}`);
    }
  }
}

