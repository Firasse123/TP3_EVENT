import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Version,
  Delete,
  Get,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { SkillEntity } from './entities/skill.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UpdateResult} from 'typeorm';

import { UpdateByCriteriaSkillDto } from './dto/update-by-criteria-skill.dto';

@Controller('skills')
export class SkillsController extends GenericController<SkillEntity> {
  constructor(private readonly skillsService: SkillsService) {
    super(skillsService);
  }

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSkillDto): Promise<SkillEntity> {
    return this.skillsService.create(dto);
  }


  @Version('1')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSkillDto,
  ): Promise<SkillEntity> {
    return this.skillsService.update(id, dto);
  }


  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaSkillDto,
  ): Promise<UpdateResult> {
    return this.skillsService.updateByCriteria(
      body.criteria,
      body.dto,
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.restore(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.delete(id);
  }
}