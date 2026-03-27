import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCvDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(70)
  age: number;

  @Type(() => Number)
  @IsNumber()
  @Min(10000000)
  @Max(99999999)
  cin: number;

  @IsNotEmpty()
  @IsString()
  job: string;

  @IsOptional()
  @IsString()
  path?: string;
}