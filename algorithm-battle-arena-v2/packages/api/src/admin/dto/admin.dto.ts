import { IsBoolean, IsNotEmpty } from 'class-validator';

/** Port of C# UserToggleDto */
export class UserToggleDto {
  @IsBoolean()
  @IsNotEmpty()
  deactivate!: boolean;
}

/** Port of C# ImportedProblemDto */
export class ImportedProblemDto {
  title!: string;
  description!: string;
  difficultyLevel?: string;
  category?: string;
  timeLimit?: number;
  memoryLimit?: number;
  createdBy?: string;
  tags?: string;
  testCases?: ImportTestCaseDto[];
  solutions?: ImportSolutionDto[];
}

export class ImportTestCaseDto {
  inputData!: string;
  expectedOutput!: string;
  isSample?: boolean;
}

export class ImportSolutionDto {
  language!: string;
  solutionText!: string;
}

/** Port of C# ImportResultDto */
export class ImportResultDto {
  ok!: boolean;
  inserted!: number;
  slugs!: string[];
  errors!: ImportErrorDto[];
}

export class ImportErrorDto {
  row!: number;
  field!: string;
  message!: string;
}

