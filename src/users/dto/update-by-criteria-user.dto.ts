import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';

export class UpdateByCriteriaUserDto {
  @IsObject()
  criteria: Record<string, any>
  @ValidateNested()
  @Type(() => UpdateUserDto)
  dto: UpdateUserDto;
}