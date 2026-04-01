import {
  Controller, Get, Post, Delete, Put, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus, Logger,
  BadRequestException, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard, AdminGuard, StudentOrAdminGuard } from '../auth/guards';
import { ProblemRepoService } from './problem-repo.service';
import { MicroCourseService } from '../micro-course/micro-course.service';
import { ProblemUpsertDto, ProblemFilterDto, ProblemGenerationDto, MicroCourseRequestDto } from './dto/problems.dto';

/**
 * Port of C# ProblemsController — /api/Problems (9 endpoints).
 */
@Controller('api/Problems')
export class ProblemsController {
  private readonly logger = new Logger(ProblemsController.name);

  constructor(
    private readonly problemRepo: ProblemRepoService,
    private readonly microCourseService: MicroCourseService,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('UpsertProblem')
  @HttpCode(HttpStatus.OK)
  async upsertProblem(@Body() dto: ProblemUpsertDto) {
    try {
      const problemId = await this.problemRepo.upsertProblem(dto);
      return { Message: 'Problem upserted successfully', ProblemId: problemId };
    } catch (error) {
      this.logger.error('UpsertProblem failed', error);
      throw new InternalServerErrorException(`Internal server error: ${(error as Error).message}`);
    }
  }

  @Post(':id/microcourse')
  @HttpCode(HttpStatus.OK)
  async getMicroCourse(@Param('id') id: string, @Body() body: MicroCourseRequestDto, @Request() req: any) {
    const result = await this.microCourseService.generateMicroCourse(
      parseInt(id, 10),
      body,
      req?.user?.email ?? 'anonymous',
    );
    if (!result) throw new NotFoundException('Problem not found or micro-course generation failed');
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProblems(
    @Query('category') category?: string,
    @Query('difficultyLevel') difficultyLevel?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const filter = {
      category, difficultyLevel, searchTerm,
      page: parseInt(page || '1', 10),
      pageSize: parseInt(pageSize || '10', 10),
    };
    const result = await this.problemRepo.getProblems(filter);
    return { problems: result.items, page: filter.page, pageSize: filter.pageSize, total: result.total };
  }

  @UseGuards(JwtAuthGuard, StudentOrAdminGuard)
  @Get(':id')
  async getProblem(@Param('id') id: string) {
    const problem = await this.problemRepo.getProblem(parseInt(id, 10));
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteProblem(@Param('id') id: string) {
    const success = await this.problemRepo.deleteProblem(parseInt(id, 10));
    if (!success) throw new NotFoundException('Problem not found');
    return { message: 'Problem deleted successfully' };
  }

  @UseGuards(JwtAuthGuard, StudentOrAdminGuard)
  @Get('categories')
  async getCategories() {
    return this.problemRepo.getCategories();
  }

  @UseGuards(JwtAuthGuard, StudentOrAdminGuard)
  @Get('difficulty-levels')
  async getDifficultyLevels() {
    return this.problemRepo.getDifficultyLevels();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateProblems(@Body() dto: ProblemGenerationDto) {
    return this.problemRepo.getRandomProblems(dto.language, dto.difficulty, dto.maxProblems);
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug/javascript-count')
  async getJavascriptCount() {
    const problems = await this.problemRepo.getRandomProblems('JavaScript', 'Mixed', 1000);
    return { count: problems.length, problems };
  }
}

