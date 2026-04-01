import { IsArray, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

/** Port of C# StartMatchRequest */
export class StartMatchRequestDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  problemIds!: number[];

  @IsInt()
  @Min(1)
  durationSec!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  preparationBufferSec?: number = 5;
}

