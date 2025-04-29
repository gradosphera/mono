import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AssetContributionDecision.Action;

@InputType(`BaseAssetContributionDecisionMetaDocumentInput`)
class BaseAssetContributionDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  @IsNumber()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  @IsNumber()
  decision_id!: number;
}

@InputType(`AssetContributionDecisionGenerateDocumentInput`)
export class AssetContributionDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAssetContributionDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`AssetContributionDecisionSignedMetaDocumentInput`)
export class AssetContributionDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAssetContributionDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AssetContributionDecisionSignedDocumentInput`)
export class AssetContributionDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AssetContributionDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: AssetContributionDecisionSignedMetaDocumentInputDTO;
}
