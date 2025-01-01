import { ObjectType, Field } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import type { ActDetailDomainInterface } from '~/domain/agenda/interfaces/act-detail-domain.interface';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';

@ObjectType('ActDetail')
export class ActDetailDTO implements ActDetailDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO, { nullable: true })
  action?: ExtendedBlockchainActionDTO;

  @Field(() => GeneratedDocumentDTO, { nullable: true })
  document?: GeneratedDocumentDTO;
}
