import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { CvHistoryEntity, CvOperationType } from './cv-history.entity';
import { CvOperationEvent, CV_EVENTS } from './cv-history.events';

@Injectable()
export class CvHistoryService {
  constructor(
    @InjectRepository(CvHistoryEntity)
    private readonly cvHistoryRepository: Repository<CvHistoryEntity>,
  ) {}

  private async record(
    operationType: CvOperationType,
    cvId: number,
    performedById: number | undefined,
  ): Promise<CvHistoryEntity> {
    const entry = this.cvHistoryRepository.create({
      operationType,
      cvId,
      performedById,
    });
    return this.cvHistoryRepository.save(entry);
  }

  @OnEvent(CV_EVENTS.CREATED)
  async onCvCreated(event: CvOperationEvent) {
    await this.record(CvOperationType.CREATE, event.cv.id, event.performedById);
  }

  @OnEvent(CV_EVENTS.UPDATED)
  async onCvUpdated(event: CvOperationEvent) {
    await this.record(CvOperationType.UPDATE, event.cv.id, event.performedById);
  }

  @OnEvent(CV_EVENTS.SOFT_DELETED)
  async onCvSoftDeleted(event: CvOperationEvent) {
    await this.record(CvOperationType.SOFT_DELETE, event.cv.id, event.performedById);
  }

  @OnEvent(CV_EVENTS.RESTORED)
  async onCvRestored(event: CvOperationEvent) {
    await this.record(CvOperationType.RESTORE, event.cv.id, event.performedById);
  }



  findByCv(cvId: number): Promise<CvHistoryEntity[]> {
    return this.cvHistoryRepository.find({
      where: { cvId },
      order: { operationDate: 'DESC' },
      relations: ['performedBy'],
    });
  }

  findAll(): Promise<CvHistoryEntity[]> {
    return this.cvHistoryRepository.find({
      order: { operationDate: 'DESC' },
      relations: ['performedBy', 'cv'],
    });
  }
}