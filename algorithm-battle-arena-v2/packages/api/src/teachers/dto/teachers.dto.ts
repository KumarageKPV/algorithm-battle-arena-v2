/** Port of C# TeacherDto — response shape for GET /api/Teachers */
export interface TeacherResponseDto {
  teacherId: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  active: boolean | null;
}

