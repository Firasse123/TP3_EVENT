import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CvEntity } from '../cvs/entities/cv.entity';
import { UserEntity } from '../users/entities/user.entity';

export enum CvOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
  HARD_DELETE = 'HARD_DELETE',
}

@Entity('cv_history')
export class CvHistoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: CvOperationType })
  operationType!: CvOperationType;

  @CreateDateColumn()
  operationDate!: Date;

  @Column({ nullable: true })
  cvId!: number;

  @ManyToOne(() => CvEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cvId' })
  cv!: CvEntity;

  @Column({ nullable: true })
  performedById!: number;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performedById' })
  performedBy!: UserEntity;

 
}