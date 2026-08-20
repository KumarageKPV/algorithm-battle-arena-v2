import { IsInt, IsNotEmpty } from 'class-validator';

/** Port of C# StudentRequestDto — body for POST /api/Students/request */
export class StudentRequestDto {
  @IsInt()
  @IsNotEmpty()
  teacherId!: number;
}

