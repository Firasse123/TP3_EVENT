import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhookService } from './webhook.service';

@Injectable()
export class WebhookListener {

  constructor(private readonly webhookService: WebhookService) {}

  @OnEvent('cv.created')
  async handleCvCreated(cv: Record<string, unknown>): Promise<void> {
    await this.webhookService.dispatch('cv.created', cv);
  }
}