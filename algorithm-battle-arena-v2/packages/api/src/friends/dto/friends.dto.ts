import { IsInt, IsNotEmpty } from 'class-validator';

/** Port of C# SendFriendRequestDto */
export class SendFriendRequestDto {
  @IsInt()
  @IsNotEmpty()
  receiverId!: number;
}

