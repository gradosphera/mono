import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('chatcoop_calendar_ics_subscriptions')
export class CalendarIcsSubscriptionTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'coop_username', type: 'varchar', length: 255 })
  coopUsername!: string;

  @Column({ name: 'secret_sha256_hex', type: 'varchar', length: 64 })
  secretSha256Hex!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
