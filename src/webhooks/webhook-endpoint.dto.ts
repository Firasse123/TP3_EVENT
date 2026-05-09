import { IsUrl, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateWebhookEndpointDto {

  @IsUrl()
  url!: string;

  @IsString()
  @MinLength(16)
  secret!: string;

  @IsOptional()
  @IsString()
  event?: string;
}

export class UpdateWebhookEndpointDto {

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}