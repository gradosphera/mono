import { ObjectType, Field } from '@nestjs/graphql';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';
import type { DecisionDetailAggregateDomainInterface } from '~/domain/document/interfaces/decision-detail-aggregate-domain.interface';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';

@ObjectType('DecisionDetailAggregate', {
  description:
    'Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета, расширенное действие, которое привело к появлению решения, и агрегат документа самого решения.',
})
export class DecisionDetailAggregateDTO implements DecisionDetailAggregateDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO)
  action!: ExtendedBlockchainActionDTO;

  @Field(() => DocumentAggregateDTO)
  documentAggregate!: DocumentAggregateDTO;

  @Field(() => [ExtendedBlockchainActionDTO])
  votes_for!: ExtendedBlockchainActionDTO[];

  @Field(() => [ExtendedBlockchainActionDTO])
  votes_against!: ExtendedBlockchainActionDTO[];
}
