import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookEndpointDto, UpdateWebhookEndpointDto } from './webhook-endpoint.dto';

@Controller('webhooks')
export class WebhookController {

  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Body() dto: CreateWebhookEndpointDto) {
    return this.webhookService.create(dto);
  }

  @Get()
  findAll() {
    return this.webhookService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebhookEndpointDto,
  ) {
    return this.webhookService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.webhookService.remove(id);
  }
}