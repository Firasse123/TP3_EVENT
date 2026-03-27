import {
  Body,
  Controller, Get,
  Param,
  ParseIntPipe,
  Patch,
  Post, Query,
  Version,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { FindOptionsWhere, QueryDeepPartialEntity, UpdateResult } from 'typeorm';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';
import { StatParamDto } from './dto/stat-param-cv.dto';

@Controller('cvs')
export class CvsController extends GenericController<
  CvEntity,
  CreateCvDto,
  UpdateCvDto
> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }
  @Post()
  override create(@Body() dto: CreateCvDto): Promise<CvEntity> {
    return super.create(dto);
  }

  @Version('1')
  @Patch(':id')
  override update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
  ): Promise<CvEntity> {
    return super.update(id, dto);
  }

  @Version('2')
  @Patch()
  override updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
  ): Promise<UpdateResult> {
    const { criteria, dto } = body;

    return this.cvsService.updateByCriteria(
      criteria as FindOptionsWhere<CvEntity>,
      dto as QueryDeepPartialEntity<CvEntity>,
    );
  }
  @Get('stats')
  statsCvNumberByAge(
    @Query() query: StatParamDto,
  ) {
    return this.cvsService.statCvNumberByAge(
      query.min,
      query.max,
    );
  }
}