import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

@Entity('payments')
export class PaymentEntity {
  @PrimaryColumn()
  hash!: string;

  @Column()
  coopname!: string;

  @Column()
  username!: string;

  @Column()
  quantity!: string;

  @Column()
  symbol!: string;

  @Column()
  method_id!: string;

  @Column()
  status!: string;

  @Column()
  type!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  memo?: string;

  @Column('json', { nullable: true })
  payment_details?: any;

  @Column('json', { nullable: true })
  blockchain_data?: any;

  @Column('json', { nullable: true })
  statement?: ISignedDocumentDomainInterface;
}
