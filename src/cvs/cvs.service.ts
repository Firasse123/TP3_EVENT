import { BadRequestException, Injectable } from '@nestjs/common';
import { GenericCrud } from '../common/db/generic-crud.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, QueryDeepPartialEntity, Repository, UpdateResult } from 'typeorm';
import { CvEntity } from './entities/cv.entity';
@Injectable()
export class CvsService extends GenericCrud<CvEntity> {
  constructor(
    @InjectRepository(CvEntity)
    cvRepository: Repository<CvEntity>,
  ) {
    super(cvRepository);
  }
  private async validateUniqueFields(
    fields: Partial<CvEntity>,
    excludeId?: number,
  ): Promise<void> {
    const checks: (keyof CvEntity)[] = ['cin'];

    for (const field of checks) {
      const value = fields[field];

      if (value !== undefined && value !== null) {
        const exists = await this.repository.findOne({
          where: { [field]: value },
        });

        if (exists && exists.id !== excludeId) {
          throw new BadRequestException(`${field} already exists`);
        }
      }
    }
  }
  async create(dto: Partial<CvEntity>): Promise<CvEntity> {
    await this.validateUniqueFields(dto);
    return super.create(dto);
  }
  async update(id: number, dto: Partial<CvEntity>): Promise<CvEntity> {
    await this.validateUniqueFields(dto, id);
    return super.update(id, dto);
  }
  async updateByCriteria(
    criteria: FindOptionsWhere<CvEntity>,
    dto: QueryDeepPartialEntity<CvEntity>,
  ): Promise<UpdateResult> {
    await this.validateUniqueFields(dto as Partial<CvEntity>);
    return super.updateByCriteria(criteria, dto);
  }

  async statCvNumberByAge(min?: number, max?: number) {
    const qb = this.repository.createQueryBuilder('cv');

    qb
      .select('cv.age', 'age')
      .addSelect('COUNT(cv.id)', 'count');

    if (min !== undefined) {
      qb.andWhere('cv.age >= :min', { min });
    }

    if (max !== undefined) {
      qb.andWhere('cv.age <= :max', { max });
    }

    qb.groupBy('cv.age');

    return qb.getRawMany();
  }
}
