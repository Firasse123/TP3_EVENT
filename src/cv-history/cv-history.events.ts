import { CvEntity } from '../cvs/entities/cv.entity';

export class CvOperationEvent {
  constructor(
    public readonly operationType: string,
    public readonly cv: CvEntity,
    public readonly performedById?: number,
  ) {}
}

export const CV_EVENTS = {
  CREATED: 'cv.created',
  UPDATED: 'cv.updated',
  SOFT_DELETED: 'cv.softDeleted',
  RESTORED: 'cv.restored',
} as const;