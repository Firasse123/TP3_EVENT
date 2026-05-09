import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  In,
  Repository,
  UpdateResult,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { CvEntity } from './entities/cv.entity';
import { UpdateCvDto } from './dto/update-cv.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CV_EVENTS } from 'src/cv-history/cv-history.events';
import { CvOperationEvent } from 'src/cv-history/cv-history.events';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skill.entity';
import { CreateCvDto } from './dto/create-cv.dto';

@Injectable()
export class CvsService extends GenericCrud<CvEntity> {
  constructor(
    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
    private readonly eventEmitter: EventEmitter2,
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

  private async resolveUser(userId?: number): Promise<UserEntity | undefined> {
    if (!userId) {
      return undefined;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }

  private async resolveSkills(skillIds?: number[]): Promise<SkillEntity[] | undefined> {
    if (!skillIds) {
      return undefined;
    }

    if (!skillIds.length) {
      return [];
    }

    const skills = await this.skillRepository.findBy({
      id: In(skillIds),
    });

    if (skills.length !== skillIds.length) {
      throw new NotFoundException('One or more skills not found');
    }

    return skills;
  }

  private async getCvWithUser(id: number, withDeleted = false): Promise<CvEntity> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      withDeleted,
      relations: {
        user: true,
      },
    });

    if (!cv) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    return cv;
  }

  async createCv(
    dto: CreateCvDto,
  ): Promise<CvEntity> {
    await this.validateUniqueCin(dto.cin);

    const { userId, skillIds, ...cvData } = dto;
    const user = await this.resolveUser(userId);
    const skills = await this.resolveSkills(skillIds);

    const newCv = await super.create({
      ...cvData,
      user,
      skills,
    });
    this.eventEmitter.emit(CV_EVENTS.CREATED, new CvOperationEvent(CV_EVENTS.CREATED, newCv, newCv.user.id));
    return newCv;
  }

  async updateCv(
    id: number,
    dto: UpdateCvDto,
  ): Promise<CvEntity> {
    if (dto.cin) {
      await this.validateUniqueCin(dto.cin, id);
    }

    const { userId, skillIds, ...cvData } = dto as CreateCvDto;
    const user = await this.resolveUser(userId);
    const skills = await this.resolveSkills(skillIds);

    const entity = await this.cvRepository.preload({
      id,
      ...cvData,
      ...(user ? { user } : {}),
      ...(skills ? { skills } : {}),
    });

    if (!entity) {
      throw new NotFoundException(`CV with id ${id} not found`);
    }

    const updatedCv = await this.cvRepository.save(entity);
    const cvWithUser = updatedCv.user ? updatedCv : await this.getCvWithUser(id);
    this.eventEmitter.emit(CV_EVENTS.UPDATED, new CvOperationEvent(CV_EVENTS.UPDATED, cvWithUser, cvWithUser.user.id));
    return updatedCv;
  }

  async softDelete(id: number): Promise<UpdateResult> {
    const cv = await this.getCvWithUser(id, true);
    const result = await super.softDelete(id);
    this.eventEmitter.emit(CV_EVENTS.SOFT_DELETED, new CvOperationEvent(CV_EVENTS.SOFT_DELETED, cv, cv.user.id));
    return result;
  }

  async restore(id: number): Promise<UpdateResult> {
    const cv = await this.getCvWithUser(id, true);
    const result = await super.restore(id);
    this.eventEmitter.emit(CV_EVENTS.RESTORED, new CvOperationEvent(CV_EVENTS.RESTORED, cv, cv.user.id));
    return result;
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

    const { userId, skillIds, ...cvData } = dto as CreateCvDto;
    const user = await this.resolveUser(userId);
    const skills = await this.resolveSkills(skillIds);

    const updated: CvEntity[] = [];

    for (const cv of cvs) {
      if (dto.cin) {
        await this.validateUniqueCin(dto.cin, cv.id);
      }

      const entity = this.cvRepository.merge(cv, {
        ...cvData,
        ...(user ? { user } : {}),
        ...(skills ? { skills } : {}),
      });
      updated.push(await this.cvRepository.save(entity));
    }

    return updated;
  }

}