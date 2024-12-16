import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { SelectBranchMetaDocumentDTO } from './select-branch-meta-document.dto';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';

@ObjectType('GeneratedSelectBranchDocument')
export class GeneratedSelectBranchDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => SelectBranchMetaDocumentDTO, { description: 'Метаинформация для создания кооперативного участка' })
  public readonly meta!: SelectBranchMetaDocumentDTO;
}
