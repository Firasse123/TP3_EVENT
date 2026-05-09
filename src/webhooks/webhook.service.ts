import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { WebhookEndpointEntity } from './webhook-endpoint.entity';
import { CreateWebhookEndpointDto, UpdateWebhookEndpointDto } from './webhook-endpoint.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEndpointEntity)
    private readonly endpointRepo: Repository<WebhookEndpointEntity>,
  ) {}

  create(dto: CreateWebhookEndpointDto) {
    const endpoint = this.endpointRepo.create({
      ...dto,
      event: dto.event ?? 'cv.created',
    });
    return this.endpointRepo.save(endpoint);
  }

  findAll() {
    return this.endpointRepo.find();
  }

  async update(id: number, dto: UpdateWebhookEndpointDto) {
    await this.endpointRepo.update(id, dto);
    return this.endpointRepo.findOneByOrFail({ id });
  }

  async remove(id: number) {
    await this.endpointRepo.delete(id);
  }

  async dispatch(event: string, payload: Record<string, unknown>): Promise<void> {
    const endpoints = await this.endpointRepo.findBy({ event, active: true });

    if (endpoints.length === 0) {
      this.logger.debug(`No active endpoints for event "${event}"`);
      return;
    }

    const body = JSON.stringify({ 
      event, 
      timestamp: new Date().toISOString(), 
      data: payload 
    });

    await Promise.allSettled(
      endpoints.map((ep) => this.sendToEndpoint(ep, body)),
    );
  }

  private async sendToEndpoint(
    endpoint: WebhookEndpointEntity,
    body: string,
  ): Promise<void> {
    const signature = createHmac('sha256', endpoint.secret)
      .update(body)
      .digest('hex');

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': endpoint.event,
        },
        body,
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        this.logger.warn(
          `Webhook ${endpoint.id} → ${endpoint.url} responded ${response.status}`,
        );
      } else {
        this.logger.log(`Webhook ${endpoint.id} delivered to ${endpoint.url}`);
      }
    } catch (err) {
      this.logger.error(
        `Webhook ${endpoint.id} → ${endpoint.url} failed: ${(err as Error).message}`,
      );
    }
  }
}