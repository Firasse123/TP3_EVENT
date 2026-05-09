import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CvHistoryService } from './cv-history.service';

@Controller('cv-history')
export class CvHistoryController {
  constructor(private readonly cvHistoryService: CvHistoryService) {}

  @Get()
  findAll() {
    return this.cvHistoryService.findAll();
  }

  @Get(':cvId')
  findByCv(@Param('cvId', ParseIntPipe) cvId: number) {
    return this.cvHistoryService.findByCv(cvId);
  }
}