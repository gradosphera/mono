import { ObjectType, Field } from '@nestjs/graphql';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';
import type { ActDetailAggregateDomainInterface } from '~/domain/document/interfaces/act-detail-aggregate-domain.interface';
import { DocumentAggregateDTO } from '~/modules/document/dto/document-aggregate.dto';

@ObjectType('ActDetailAggregate', {
  description:
    'Комплексный объект акта, содержащий полную информацию о сгенерированном и опубликованном документе с его агрегатом',
})
export class ActDetailAggregateDTO implements ActDetailAggregateDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO, { nullable: true })
  action!: ExtendedBlockchainActionDTO;

  @Field(() => DocumentAggregateDTO, { nullable: true })
  documentAggregate!: DocumentAggregateDTO;
}
