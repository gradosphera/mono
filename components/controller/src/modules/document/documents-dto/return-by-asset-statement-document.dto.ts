import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';
import { CommonRequestInputDTO } from '../../cooplace/dto/common-request-input.dto';

// интерфейс параметров для генерации
type action = Cooperative.Registry.ReturnByAssetStatement.Action;

@InputType(`BaseReturnByAssetStatementMetaDocumentInput`)
class BaseReturnByAssetStatementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field(() => CommonRequestInputDTO, { description: 'Запрос на внесение имущественного паевого взноса' })
  @IsNotEmpty()
  @ValidateNested()
  request!: CommonRequestInputDTO;
}

@InputType(`ReturnByAssetStatementGenerateDocumentInput`)
export class ReturnByAssetStatementGenerateDocumentInputDTO
  extends IntersectionType(
    BaseReturnByAssetStatementMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`ReturnByAssetStatementSignedMetaDocumentInput`)
export class ReturnByAssetStatementSignedMetaDocumentInputDTO
  extends IntersectionType(BaseReturnByAssetStatementMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ReturnByAssetStatementSignedDocumentInput`)
export class ReturnByAssetStatementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ReturnByAssetStatementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ReturnByAssetStatementSignedMetaDocumentInputDTO;
}
