import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { CvEntity } from './entities/cv.entity';
import { UpdateCvDto } from './dto/update-cv.dto';

@Injectable()
export class CvsService extends GenericCrud<CvEntity> {
  constructor(
    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>,
  ) {
    super(cvRepository);
  }

  private async validateUniqueCin(cin: number, excludeId?: number) {
    const exists = await this.cvRepository.findOne({
      where: { cin },
    });

    if (exists && exists.id !== excludeId) {
      throw new BadRequestException('CIN already exists');
    }
  }


  async createCv(
    dto: Partial<CvEntity>,
  ): Promise<CvEntity> {
    await this.validateUniqueCin(dto.cin!);

    return super.create({
      ...dto,
    });
  }

  async updateCv(
    id: number,
    dto: UpdateCvDto,
  ): Promise<CvEntity> {
    if (dto.cin) {
      await this.validateUniqueCin(dto.cin, id);
    }

    return super.update(id, dto);
  }

  async statCvNumberByAge(min?: number, max?: number) {
    const qb = this.cvRepository.createQueryBuilder('cv');

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
  async updateByCriteriaCv(
    criteria: FindOptionsWhere<CvEntity>,
    dto: UpdateCvDto,
  ): Promise<CvEntity[]> {

    const cvs = await this.cvRepository.find({
      where: criteria,
    });

    if (!cvs.length) {
      throw new NotFoundException('No CV found');
    }

    const updated: CvEntity[] = [];

    for (const cv of cvs) {
      if (dto.cin) {
        await this.validateUniqueCin(dto.cin, cv.id);
      }

      const entity = this.cvRepository.merge(cv, dto);
      updated.push(await this.cvRepository.save(entity));
    }

    return updated;
  }

}