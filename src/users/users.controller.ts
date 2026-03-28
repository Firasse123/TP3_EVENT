import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch, Post,
  Version,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateUserDto } from './dto/update-user.dto';
import {UpdateResult } from 'typeorm';

import { UpdateByCriteriaUserDto } from './dto/update-by-criteria-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController extends GenericController<UserEntity> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
      return this.usersService.findOne(id);

  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
      return this.usersService.updateUser(id, dto);
  }

  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.updateByCriteria(
      body.criteria,
      body.dto,
    );
  }
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}