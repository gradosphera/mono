import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';
import type { Cooperative } from 'cooptypes';
import { SignedDigitalDocumentInputDTO } from '~/modules/common/dto/signed-digital-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';

@InputType('SelectBranchMetaDocumentInput')
export class SelectBranchMetaDocumentInputDTO
  extends MetaDocumentInputDTO
  implements Cooperative.Registry.SelectBranchStatement.Action
{
  @Field({ description: 'Имя аккаунта кооперативного участка' })
  @IsString()
  @IsOptional()
  braname!: string;
}

@InputType('SelectBranchDocumentInput')
export class SelectBranchSignedDigitalDocumentInputDTO extends SignedDigitalDocumentInputDTO<SelectBranchMetaDocumentInputDTO> {
  @Field(() => SelectBranchMetaDocumentInputDTO, { description: 'Метаинформация для создания кооперативного участка' })
  public readonly meta!: SelectBranchMetaDocumentInputDTO;
}
