import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateContactDto {
  @IsOptional()
  user: Types.ObjectId;

  @IsOptional()
  list: Types.ObjectId;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;
}
