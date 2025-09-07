import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

const EntityName = 'capital_votes';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_project_hash`, ['project_hash'])
@Index(`idx_${EntityName}_voter`, ['voter'])
@Index(`idx_${EntityName}_recipient`, ['recipient'])
export class VoteTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (votes.hpp)
  @Column({ type: 'varchar', length: 64 })
  project_hash!: string;

  @Column({ type: 'varchar', length: 12 })
  voter!: string;

  @Column({ type: 'varchar', length: 12 })
  recipient!: string;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'timestamp' })
  voted_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
