import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, QueryDeepPartialEntity, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService extends GenericCrud<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }
  private async validateUniqueFields(
    fields: Partial<UserEntity>,
    excludeId?: number,
  ): Promise<void> {
    const checks: (keyof UserEntity)[] = ['email', 'username'];

    for (const field of checks) {
      if (fields[field]) {
        const exists = await this.repository.findOne({
          where: { [field]: fields[field] },
        });

        if (exists && exists.id !== excludeId) {
          throw new BadRequestException(`${field} already exists`);
        }
      }
    }
  }
  async create(dto: CreateUserDto): Promise<UserEntity> {
    await this.validateUniqueFields(dto);
    return super.create(dto);
  }
  async update(id: number, dto: Partial<UserEntity>): Promise<UserEntity> {
    await this.validateUniqueFields(dto, id);
    return super.update(id, dto);
  }
  async updateByCriteria(
    criteria: FindOptionsWhere<UserEntity>,
    dto: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> {
    await this.validateUniqueFields(dto as Partial<UserEntity>);
    return super.updateByCriteria(criteria, dto);
  }
}
