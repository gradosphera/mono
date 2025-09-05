import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { ForkDomainInterface } from '~/domain/parser/interfaces/fork-domain.interface';

/**
 * TypeORM сущность для хранения форков блокчейна
 * Реализует доменный интерфейс ForkDomainInterface
 */
@Entity('blockchain_forks')
@Index(['block_num'])
export class ForkEntity implements ForkDomainInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  chain_id!: string;

  @Column({ type: 'bigint' })
  block_num!: number;

  @CreateDateColumn()
  created_at!: Date;
}
