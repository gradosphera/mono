import { ObjectType, Field } from '@nestjs/graphql';
import type { StatementDetailDomainInterface } from '~/domain/agenda/interfaces/statement-detail-domain.interface';
import { ExtendedBlockchainActionDTO } from './extended-action.dto';
import { StatementDocumentUnion, type StatementDocumentUnionType } from '../../document/unions/statement-document.union';

@ObjectType('StatementDetail', {
  description:
    'Комплексный объект цифрового документа заявления (или другого ведущего документа для цепочки принятия решений совета)',
})
export class StatementDetailDTO implements StatementDetailDomainInterface {
  @Field(() => ExtendedBlockchainActionDTO)
  action!: ExtendedBlockchainActionDTO;

  @Field(() => StatementDocumentUnion)
  document!: StatementDocumentUnionType;
}
