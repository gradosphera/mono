import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('migrations')
export class MigrationEntity {
  @PrimaryColumn('varchar')
  version!: string;

  @Column('varchar')
  name!: string;

  @Column('timestamp')
  executedAt!: Date;

  @Column('boolean', { default: true })
  success!: boolean;

  @Column('text', { nullable: true })
  logs?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
