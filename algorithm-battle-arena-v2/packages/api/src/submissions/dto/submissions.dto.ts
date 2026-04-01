import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

/** Port of C# SubmissionDto */
export class CreateSubmissionDto {
  @IsInt()
  @IsNotEmpty()
  matchId!: number;

  @IsInt()
  @IsNotEmpty()
  problemId!: number;

  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsString()
  status?: string = 'Submitted';

  @IsOptional()
  @IsInt()
  score?: number;
}

