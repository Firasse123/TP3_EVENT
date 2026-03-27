import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class DateFilterDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  minDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  maxDate?: Date;
}