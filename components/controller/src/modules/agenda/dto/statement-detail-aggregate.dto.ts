import { ObjectType, Field } from '@nestjs/graphql';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';
import type { StatementDetailAggregateDomainInterface } from '~/domain/document/interfaces/statement-detail-aggregate-domain.interface';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';

@ObjectType('StatementDetailAggregate', {
  description:
    'Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета) с агрегатом документа',
})
export class StatementDetailAggregateDTO implements StatementDetailAggregateDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO)
  action!: ExtendedBlockchainActionDTO;

  @Field(() => DocumentAggregateDTO)
  documentAggregate!: DocumentAggregateDTO;
}
