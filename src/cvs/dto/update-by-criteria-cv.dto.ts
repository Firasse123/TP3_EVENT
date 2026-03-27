import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCvDto } from './update-cv.dto';

export class UpdateByCriteriaCvDto {
  @IsObject()
  criteria: Record<string, any>;

  @ValidateNested()
  @Type(() => UpdateCvDto)
  dto: UpdateCvDto;
}