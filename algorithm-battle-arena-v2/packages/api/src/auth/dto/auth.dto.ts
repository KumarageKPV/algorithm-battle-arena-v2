import { IsEmail, IsNotEmpty, IsOptional, IsString, IsInt, MinLength } from 'class-validator';

export class UserForLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class StudentForRegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsString()
  role?: string = 'Student';
}

export class TeacherForRegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsString()
  role?: string = 'Teacher';
}

/** Internal DTO — holds hash/salt from DB for verification */
export class UserForLoginConfirmationDto {
  passwordHash!: Buffer;
  passwordSalt!: Buffer;
}

