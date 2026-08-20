import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

/** Port of C# SendMessageDto */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

/** Port of C# CreateFriendConversationDto */
export class CreateFriendConversationDto {
  @IsOptional()
  @IsInt()
  friendId?: number;

  @IsOptional()
  @IsString()
  friendEmail?: string;
}

/** Port of C# CreateConversationDto */
export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsInt()
  referenceId?: number;

  @IsOptional()
  @IsString({ each: true })
  participantEmails?: string[];
}

