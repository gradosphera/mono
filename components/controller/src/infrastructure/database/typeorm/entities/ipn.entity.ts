import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * TypeORM сущность для хранения IPN (Instant Payment Notification) данных от платежных провайдеров
 */
@Entity('ipn')
@Index(['provider', 'data'])
export class IpnEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  @Index()
  provider!: string;

  @Column('jsonb')
  data!: object;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor(data?: Partial<IpnEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
