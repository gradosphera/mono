import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import type { ISignedDocumentDomainInterface } from '~/domain/document/interfaces/signed-document-domain.interface';

@Entity('candidates')
export class CandidateEntity {
  @PrimaryColumn()
  username!: string;

  @Column()
  coopname!: string;

  @Column({ nullable: true })
  braname!: string;

  @Column()
  status!: string;

  @Column()
  type!: string; // individual, organization, entrepreneur

  @CreateDateColumn()
  created_at!: Date;

  @Column('json', { nullable: true })
  statement?: ISignedDocumentDomainInterface;

  @Column('json', { nullable: true })
  wallet_agreement?: ISignedDocumentDomainInterface;

  @Column('json', { nullable: true })
  signature_agreement?: ISignedDocumentDomainInterface;

  @Column('json', { nullable: true })
  privacy_agreement?: ISignedDocumentDomainInterface;

  @Column('json', { nullable: true })
  user_agreement?: ISignedDocumentDomainInterface;

  @Column({ nullable: false })
  registration_hash!: string;

  @Column({ nullable: true })
  referer?: string;

  @Column()
  public_key!: string;

  @Column({ nullable: true })
  meta?: string;
}
