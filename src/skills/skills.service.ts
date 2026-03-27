import { Injectable } from '@nestjs/common';
import { GenericCrud } from '../common/db/generic-crud.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillEntity } from './entities/skill.entity';
@Injectable()
export class SkillsService extends GenericCrud<SkillEntity> {
  constructor(
    @InjectRepository(SkillEntity)
    skillRepository: Repository<SkillEntity>,
  ) {
    super(skillRepository);
  }
}
