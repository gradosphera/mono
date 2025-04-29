import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { MeetPreProcessingDomainEntity } from '~/domain/meet/entities/meet-pre-domain.entity';
import type { MeetPreProcessingDomainInterface } from '~/domain/meet/interfaces/meet-pre-domain.interface';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { Cooperative } from 'cooptypes';
import type { AgendaMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@Entity('meet_pre')
export class MeetPreEntity implements MeetPreProcessingDomainInterface {
  @PrimaryColumn()
  hash!: string;

  @Column()
  coopname!: string;

  @Column()
  initiator!: string;

  @Column()
  presider!: string;

  @Column()
  secretary!: string;

  @Column('jsonb')
  agenda!: AgendaMeetPointInputDomainInterface[];

  @Column('timestamp')
  open_at!: Date;

  @Column('timestamp')
  close_at!: Date;

  @Column('jsonb', { nullable: true })
  proposal?: DocumentAggregateDomainInterface;

  @CreateDateColumn()
  created_at!: Date;

  constructor(data?: MeetPreProcessingDomainInterface) {
    if (data) {
      this.hash = data.hash;
      this.coopname = data.coopname;
      this.initiator = data.initiator;
      this.presider = data.presider;
      this.secretary = data.secretary;
      this.agenda = data.agenda;
      this.open_at = data.open_at;
      this.close_at = data.close_at;
      this.proposal = data.proposal;
    }
  }

  // Метод для преобразования ORM-сущности в доменную сущность
  toDomainEntity(): MeetPreProcessingDomainEntity {
    return new MeetPreProcessingDomainEntity({
      hash: this.hash,
      coopname: this.coopname,
      initiator: this.initiator,
      presider: this.presider,
      secretary: this.secretary,
      agenda: this.agenda,
      open_at: this.open_at,
      close_at: this.close_at,
      proposal: this.proposal,
    });
  }

  // Статический метод для создания ORM-сущности из доменной сущности
  static fromDomainEntity(domainEntity: MeetPreProcessingDomainEntity): MeetPreEntity {
    return new MeetPreEntity(domainEntity);
  }
}
