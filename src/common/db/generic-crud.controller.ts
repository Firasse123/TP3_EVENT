import {
  Param,
  Delete,
  Patch,
  Get,
  Post,
  Body,
  ParseIntPipe,
  Version, Query,
} from '@nestjs/common';
import {
  DeleteResult,
  FindOptionsWhere, QueryDeepPartialEntity,
  UpdateResult,
} from 'typeorm';
import { GenericCrud } from './generic-crud.service';
import { DateFilterDto } from './date-filter.dto';

export class GenericController<
  Entity extends { id: number },
  CreateDto,
  UpdateDto,
> {
  constructor(protected service: GenericCrud<Entity>) {
  }

  @Get()
  findAll(): Promise<Entity[]> {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateDto): Promise<Entity> {
    return this.service.create(dto);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Entity> {
    return this.service.findOne(id);
  }
  @Delete(':id')
  softDelete(@Param('id', ParseIntPipe) id: number): Promise<UpdateResult> {
    return this.service.softDelete(id);
  }
  @Version('1')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDto,
  ): Promise<Entity> {
    return this.service.update(id, dto);
  }

  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: {
      criteria: FindOptionsWhere<Entity>;
      dto: QueryDeepPartialEntity<Entity>;
    },
  ): Promise<UpdateResult> {
    const { criteria, dto } = body;

    return this.service.updateByCriteria(criteria, dto);
  }
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.service.delete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number): Promise<UpdateResult> {
    return this.service.restore(id);
  }
  @Get('filter/date')
  findByDate(
    @Query() query: DateFilterDto,
  ): Promise<Entity[]> {
    return this.service.findWithDateInterval(
      'createdAt' as keyof Entity,
      query.minDate,
      query.maxDate,
    );
  }

}
