import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import type { Cooperative } from 'cooptypes';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';

@InputType('SelectBranchMetaDocumentInput')
export class SelectBranchMetaDocumentInputDTO
  extends MetaDocumentInputDTO
  implements Cooperative.Registry.SelectBranchStatement.Action
{
  @Field({ description: 'Имя аккаунта кооперативного участка' })
  @IsString()
  braname!: string;
}
