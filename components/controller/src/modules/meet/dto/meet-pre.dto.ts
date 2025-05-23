import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AgendaMeetPointDTO } from './agenda-meet-point.dto';
import type { MeetPreProcessingDomainInterface } from '~/domain/meet/interfaces/meet-pre-domain.interface';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';

@ObjectType('MeetPreProcessing', { description: 'Предварительные данные собрания перед обработкой' })
export class MeetPreProcessingDTO implements MeetPreProcessingDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Хеш собрания' })
  hash!: string;

  @Field(() => String, { description: 'Инициатор собрания' })
  initiator!: string;

  @Field(() => String, { description: 'Председатель собрания' })
  presider!: string;

  @Field(() => String, { description: 'Секретарь собрания' })
  secretary!: string;

  @Field(() => [AgendaMeetPointDTO], { description: 'Повестка собрания' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaMeetPointDTO)
  agenda!: AgendaMeetPointDTO[];

  @Field(() => Date, { description: 'Дата открытия собрания' })
  open_at!: Date;

  @Field(() => Date, { description: 'Дата закрытия собрания' })
  close_at!: Date;

  @Field(() => DocumentAggregateDTO, {
    nullable: true,
    description: 'Документ с предложением повестки собрания',
  })
  @IsOptional()
  proposal?: DocumentAggregateDTO;

  constructor(data: MeetPreProcessingDomainInterface) {
    if (data) {
      this.coopname = data.coopname;
      this.hash = data.hash;
      this.initiator = data.initiator;
      this.presider = data.presider;
      this.secretary = data.secretary;
      this.agenda = data.agenda.map((item) => new AgendaMeetPointDTO(item));
      this.open_at = data.open_at;
      this.close_at = data.close_at;

      // Если есть предложение, преобразуем его в DTO
      if (data.proposal) {
        this.proposal = new DocumentAggregateDTO(data.proposal);
      }
    }
  }
}
