import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEndpointEntity } from './webhook-endpoint.entity';
import { WebhookService } from './webhook.service';
import { WebhookListener } from './webhook.listener';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpointEntity])],
  providers: [WebhookService, WebhookListener],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}