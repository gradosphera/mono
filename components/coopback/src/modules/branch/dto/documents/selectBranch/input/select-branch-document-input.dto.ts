import { InputType, Field } from '@nestjs/graphql';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SelectBranchMetaDocumentInputDTO } from './select-branch-meta-document-input.dto';

@InputType('SelectBranchSignedDigitalDocumentInput')
export class SelectBranchSignedDigitalDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => SelectBranchMetaDocumentInputDTO, { description: 'Метаинформация для создания кооперативного участка' })
  public readonly meta!: SelectBranchMetaDocumentInputDTO;
}
