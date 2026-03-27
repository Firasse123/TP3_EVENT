
import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StatParamDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max?: number;
}