import { Module } from '@nestjs/common';
import { MicroCourseService } from './micro-course.service';
import { ProblemRepoService } from '../problems/problem-repo.service';

@Module({
  providers: [MicroCourseService, ProblemRepoService],
  exports: [MicroCourseService],
})
export class MicroCourseModule {}
