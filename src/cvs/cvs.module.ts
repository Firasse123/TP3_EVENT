import { Module } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEntity } from './entities/cv.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skill.entity';

@Module({
  controllers: [CvsController],
  providers: [CvsService],
  imports: [TypeOrmModule.forFeature([CvEntity, UserEntity, SkillEntity])],
})
export class CvsModule {}