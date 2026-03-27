import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { SkillEntity } from './entities/skill.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { FindOptionsWhere, QueryDeepPartialEntity, UpdateResult } from 'typeorm';
import { UpdateByCriteriaSkillDto } from './dto/update-by-criteria-skill.dto';

@Controller('skills')
export class SkillsController extends GenericController<
  SkillEntity,
  CreateSkillDto,
  UpdateSkillDto
> {
  constructor(private readonly skillsService: SkillsService) {
    super(skillsService);
  }

  @Post()
  override create(@Body() dto: CreateSkillDto): Promise<SkillEntity> {
    return super.create(dto);
  }

  @Version('1')
  @Patch(':id')
  override update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSkillDto,
  ): Promise<SkillEntity> {
    return super.update(id, dto);
  }

  @Version('2')
  @Patch()
  override updateByCriteria(
    @Body() body: UpdateByCriteriaSkillDto,
  ): Promise<UpdateResult> {
    const { criteria, dto } = body;

    return this.skillsService.updateByCriteria(
      criteria as FindOptionsWhere<SkillEntity>,
      dto as QueryDeepPartialEntity<SkillEntity>,
    );
  }
}