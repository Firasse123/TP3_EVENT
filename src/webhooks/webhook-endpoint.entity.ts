import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('webhook_endpoint')
export class WebhookEndpointEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column()
  secret!: string;

  @Column({ default: 'cv.created' })
  event!: string;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}