import {
  Injectable,
} from '@nestjs/common';
import {
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { SkillEntity } from './entities/skill.entity';

@Injectable()
export class SkillsService extends GenericCrud<SkillEntity> {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,
  ) {
    super(skillRepository);
  }


}