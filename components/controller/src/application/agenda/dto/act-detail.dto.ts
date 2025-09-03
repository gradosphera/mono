import { ObjectType, Field } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import type { ActDetailDomainInterface } from '~/domain/agenda/interfaces/act-detail-domain.interface';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';

@ObjectType('ActDetail', {
  description: 'Массив комплексных актов, содержащих полную информацию о сгенерированном и опубликованном документах',
})
export class ActDetailDTO implements ActDetailDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO, { nullable: true })
  action?: ExtendedBlockchainActionDTO;

  @Field(() => GeneratedDocumentDTO, { nullable: true })
  document?: GeneratedDocumentDTO;
}
