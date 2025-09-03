import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * TypeORM сущность для отслеживания состояния синхронизации блокчейна
 */
@Entity('blockchain_sync_state')
export class SyncStateEntity {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  key!: string;

  @Column({ type: 'bigint' })
  block_num!: number;

  @UpdateDateColumn()
  updated_at!: Date;
}
