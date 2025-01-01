import { ObjectType, Field } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import type { DecisionDetailDomainInterface } from '~/domain/agenda/interfaces/decision-detail-domain.interface';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';

@ObjectType('DecisionDetail', {
  description: 'Комплексный объект решения совета, включающий в себя информацию о голосовавших членах совета',
})
export class DecisionDetailDTO implements DecisionDetailDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO)
  action!: ExtendedBlockchainActionDTO;

  @Field(() => GeneratedDocumentDTO)
  document!: GeneratedDocumentDTO;

  @Field(() => [ExtendedBlockchainActionDTO])
  votes_for!: ExtendedBlockchainActionDTO[];

  @Field(() => [ExtendedBlockchainActionDTO])
  votes_against!: ExtendedBlockchainActionDTO[];
}
