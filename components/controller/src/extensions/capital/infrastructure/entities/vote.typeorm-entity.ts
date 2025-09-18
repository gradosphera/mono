import { Entity, Column, Index } from 'typeorm';
import { BaseTypeormEntity } from './base.typeorm-entity';

const EntityName = 'capital_votes';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_voter`, ['voter'])
@Index(`idx_${EntityName}_recipient`, ['recipient'])
@Index(`idx_${EntityName}_created_at`, ['_created_at'])
export class VoteTypeormEntity extends BaseTypeormEntity {
  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  // Поля из блокчейна (votes.hpp)
  @Column({ type: 'varchar' })
  project_hash!: string;

  @Column({ type: 'varchar' })
  voter!: string;

  @Column({ type: 'varchar' })
  recipient!: string;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'timestamp' })
  voted_at!: Date;

  @Column({ type: 'timestamp' })
  created_at!: Date;
}
