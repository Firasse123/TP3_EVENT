import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvHistoryEntity } from './cv-history.entity';
import { CvHistoryService } from './cv-history.service';
import { CvHistoryController } from './cv-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CvHistoryEntity])],
  providers: [CvHistoryService],
  controllers: [CvHistoryController],
  exports: [CvHistoryService],
})
export class CvHistoryModule {}