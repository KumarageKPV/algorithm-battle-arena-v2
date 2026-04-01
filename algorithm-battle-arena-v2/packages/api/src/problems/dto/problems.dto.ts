import { IsString, IsOptional, IsInt, Min } from 'class-validator';

/** Port of C# ProblemFilterDto */
export class ProblemFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}

/** Port of C# ProblemUpsertDto */
export class ProblemUpsertDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @IsOptional()
  @IsInt()
  memoryLimit?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  testCases?: string; // JSON string

  @IsOptional()
  @IsString()
  solutions?: string; // JSON string
}

/** Port of C# ProblemGenerationDto */
export class ProblemGenerationDto {
  @IsString()
  language!: string;

  @IsString()
  difficulty!: string;

  @IsInt()
  @Min(1)
  maxProblems!: number;
}

/** Port of C# MicroCourseRequestDto */
export class MicroCourseRequestDto {
  @IsOptional()
  @IsInt()
  timeLimitSeconds?: number;

  @IsOptional()
  @IsInt()
  remainingSec?: number;

  @IsOptional()
  @IsString()
  language?: string = '';
}

