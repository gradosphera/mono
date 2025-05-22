import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MeetQuestionResultDTO } from './meet-question-result.dto';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MeetProcessedDomainInterface } from '~/domain/meet/interfaces/meet-processed-domain.interface';
import { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import { SignedDigitalDocumentDTO } from '~/modules/document/dto/signed-digital-document.dto';

@ObjectType('MeetProcessed', { description: 'Данные о собрании после обработки' })
export class MeetProcessedDTO {
  @Field(() => String, { description: 'Имя кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Хеш собрания' })
  hash!: string;

  @Field(() => [MeetQuestionResultDTO], { description: 'Результаты голосования по вопросам' })
  results!: MeetQuestionResultDTO[];

  @Field(() => Int, { description: 'Количество подписанных бюллетеней' })
  signed_ballots!: number;

  @Field(() => Int, { description: 'Процент кворума' })
  quorum_percent!: number;

  @Field(() => Boolean, { description: 'Пройден ли кворум' })
  quorum_passed!: boolean;

  @Field(() => SignedDigitalDocumentDTO, { description: 'Документ решения из блокчейна' })
  decision!: SignedDigitalDocumentDTO;

  @Field(() => DocumentAggregateDTO, { nullable: true, description: 'Агрегат документа решения' })
  @ValidateNested()
  @Type(() => DocumentAggregateDTO)
  decisionAggregate!: DocumentAggregateDTO | null;

  constructor(data: MeetProcessedDomainInterface, decisionAggregate?: DocumentAggregateDomainInterface | null) {
    Object.assign(this, {
      ...data,
      results: data.results.map((result) => new MeetQuestionResultDTO(result)),
      decisionAggregate: decisionAggregate || null,
    });
  }
}
