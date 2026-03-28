import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimeStampEntity } from '../../common/db/timestamp.entity';
import { CvEntity } from '../../cvs/entities/cv.entity';

@Entity('skill')
export class SkillEntity extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  designation: string;
  @ManyToMany(() => CvEntity, (cv) => cv.skills)
  cvs: CvEntity[];
}