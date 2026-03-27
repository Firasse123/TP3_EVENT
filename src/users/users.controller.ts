import { Body, Controller, Param, ParseIntPipe, Patch, Post, Version } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOptionsWhere, QueryDeepPartialEntity } from 'typeorm';
import { UpdateByCriteriaUserDto } from './dto/update-by-criteria-user.dto';

@Controller('users')
export class UsersController extends GenericController<
  UserEntity,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }
  @Post()
  override create(@Body() dto: CreateUserDto) {
    return super.create(dto);
  }

  @Version('1')
  @Patch(':id')
  override update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return super.update(id, dto);
  }
  @Version('2')
  @Patch()
  override updateByCriteria(
    @Body() body: UpdateByCriteriaUserDto,
  ) {
    const { criteria, dto } = body;

    return this.service.updateByCriteria(
      criteria,
      dto as QueryDeepPartialEntity<UserEntity>,
    );
  }
}
