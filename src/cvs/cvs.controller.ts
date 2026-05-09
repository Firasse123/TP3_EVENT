import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Delete,
  Req
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Sse } from '@nestjs/common';

@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService , private readonly eventEmitter: EventEmitter2) {
    super(cvsService);
  }

  @Get()
  findAll() {
    return this.cvsService.findAll();
  }

  @Get('stats')
  statsCvNumberByAge(@Query() query: StatParamDto) {
    return this.cvsService.statCvNumberByAge(
      query.min,
      query.max,
    );
  }
  
  @Sse('sse')
  sse(@Req() req): Observable<MessageEvent> {
    let user = (req as any).user as { id: number; role: string } | undefined;

    if (!user) {
      const roleQuery = typeof req.query.role === 'string' ? req.query.role : undefined;
      const userIdQuery = typeof req.query.userId === 'string' ? req.query.userId : undefined;
      const parsedUserId = userIdQuery ? Number(userIdQuery) : undefined;
      const role = roleQuery === 'admin' ? 'admin' : 'user';

      if (role === 'admin') {
        user = { id: parsedUserId ?? 1, role: 'admin' };
      } else if (parsedUserId && !Number.isNaN(parsedUserId)) {
        user = { id: parsedUserId, role: 'user' };
      } else {
        user = { id: 1, role: 'admin' };
      }
    }

    return fromEvent(this.eventEmitter, 'cv.*').pipe(
      filter((event: any) =>
        user.role === 'admin' || event.cv?.user?.id === user.id
      ),
      map((event: any) =>
        new MessageEvent(event.operationType, { data: event })
      ),
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,

  ) {
    return this.cvsService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateCvDto,
  ) {
    return this.cvsService.createCv(dto);
  }


  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,

  ): Promise<CvEntity> {
      return this.cvsService.updateCv(id, dto);
  }


  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
   return this.cvsService.softDelete(id);

  }


  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
  ) {
    return this.cvsService.updateByCriteriaCv(
      body.criteria,
      body.dto
    );
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.restore(id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.delete(id);
  }
}