import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ProgramPropertyStatus } from '../../domain/enums/program-property-status.enum';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

const EntityName = 'capital_program_properties';
@Entity(EntityName)
@Index(`idx_${EntityName}_blockchain_id`, ['id'])
@Index(`idx_${EntityName}_property_hash`, ['property_hash'])
@Index(`idx_${EntityName}_username`, ['username'])
@Index(`idx_${EntityName}_status`, ['status'])
export class ProgramPropertyTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  _id!: string;

  @Column({ type: 'integer', nullable: true, unique: true })
  id!: number;

  @Column({ type: 'integer', nullable: true })
  block_num!: number;

  @Column({ type: 'boolean', default: true })
  present!: boolean;

  // Поля из блокчейна (program_properties.hpp)
  @Column({ type: 'varchar' })
  coopname!: string;

  @Column({ type: 'varchar' })
  username!: string;

  @Column({ type: 'varchar' })
  blockchain_status!: string;

  @Column({ type: 'varchar' })
  property_hash!: string;

  @Column({ type: 'varchar' })
  property_amount!: string;

  @Column({ type: 'text' })
  property_description!: string;

  @Column({ type: 'json' })
  statement!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  authorization!: ISignedDocumentDomainInterface;

  @Column({ type: 'json' })
  act!: ISignedDocumentDomainInterface;

  @Column({ type: 'timestamp' })
  created_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at_db!: Date;

  // Доменные поля (расширения)
  @Column({
    type: 'enum',
    enum: ProgramPropertyStatus,
    default: ProgramPropertyStatus.CREATED,
  })
  status!: ProgramPropertyStatus;
}
