import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSkillDto } from './update-skill.dto';

export class UpdateByCriteriaSkillDto {
  @IsObject()
  criteria: Record<string, any>

  @ValidateNested()
  @Type(() => UpdateSkillDto)
  dto: UpdateSkillDto;
}