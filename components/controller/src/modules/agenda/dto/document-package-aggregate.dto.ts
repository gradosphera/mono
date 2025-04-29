import { ObjectType, Field } from '@nestjs/graphql';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';
import { StatementDetailAggregateDTO } from './statement-detail-aggregate.dto';
import { DecisionDetailAggregateDTO } from './decision-detail-aggregate.dto';
import { ActDetailAggregateDTO } from './act-detail-aggregate.dto';
import type { DocumentPackageAggregateDomainInterface } from '~/domain/document/interfaces/document-package-aggregate-domain.interface';

@ObjectType('DocumentPackageAggregate', {
  description:
    'Комплексный объект папки цифрового документа с агрегатами, который включает в себя заявление, решение, акты и связанные документы',
})
export class DocumentPackageAggregateDTO implements DocumentPackageAggregateDomainInterface {
  @Field(() => StatementDetailAggregateDTO, {
    description: 'Объект цифрового документа заявления с агрегатом',
    nullable: true,
  })
  statement!: StatementDetailAggregateDTO | null;

  @Field(() => DecisionDetailAggregateDTO, {
    description: 'Объект цифрового документа решения с агрегатом',
    nullable: true,
  })
  decision!: DecisionDetailAggregateDTO | null;

  @Field(() => [ActDetailAggregateDTO], {
    description: 'Массив объект(ов) актов с агрегатами, относящихся к заявлению',
  })
  acts!: ActDetailAggregateDTO[];

  @Field(() => [DocumentAggregateDTO], {
    description: 'Массив связанных документов с агрегатами, извлечённых из мета-данных',
  })
  links!: DocumentAggregateDTO[];
}
