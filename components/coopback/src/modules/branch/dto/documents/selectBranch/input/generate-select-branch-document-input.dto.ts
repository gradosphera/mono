import { InputType, Field, OmitType } from '@nestjs/graphql';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { Cooperative } from 'cooptypes';
import { IsString } from 'class-validator';

@InputType('GenerateSelectBranchDocumentInput')
export class GenerateSelectBranchDocumentInputDTO extends OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const) {
  @Field({ description: 'Имя аккаунта кооперативного участка' })
  @IsString()
  braname!: string;

  // Исключаем из GraphQL-схемы и устанавливаем автоматически
  registry_id: number;

  constructor() {
    super();
    this.registry_id = Cooperative.Registry.SelectBranchStatement.registry_id;
  }
}
