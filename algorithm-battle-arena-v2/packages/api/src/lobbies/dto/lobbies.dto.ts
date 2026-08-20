import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

/** Port of C# LobbyCreateDto */
export class LobbyCreateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxPlayers?: number = 10;

  @IsOptional()
  @IsString()
  mode?: string = '1v1';

  @IsOptional()
  @IsString()
  difficulty?: string = 'Medium';
}

/** Port of C# UpdatePrivacyDto */
export class UpdatePrivacyDto {
  @IsNotEmpty()
  isPublic!: boolean;
}

/** Port of C# UpdateDifficultyDto */
export class UpdateDifficultyDto {
  @IsString()
  @IsNotEmpty()
  difficulty!: string;
}

