import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { ValidateNested, IsNotEmpty } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';
import { CommonRequestInputDTO } from './common-request-input.dto';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AssetContributionStatement.Action;

@InputType(`BaseAssetContributionStatementMetaDocumentInput`)
class BaseAssetContributionStatementMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field(() => CommonRequestInputDTO, { description: 'Запрос на внесение имущественного паевого взноса' })
  @IsNotEmpty()
  request!: CommonRequestInputDTO;
}

@ObjectType(`BaseAssetContributionStatementMetaDocumentOutput`)
class BaseAssetContributionStatementMetaDocumentOutputDTO {}

@InputType(`AssetContributionStatementGenerateDocumentInput`)
export class AssetContributionStatementGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAssetContributionStatementMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`AssetContributionStatementSignedMetaDocumentInput`)
export class AssetContributionStatementSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAssetContributionStatementMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AssetContributionStatementSignedDocumentInput`)
export class AssetContributionStatementSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AssetContributionStatementSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: AssetContributionStatementSignedMetaDocumentInputDTO;
}

@ObjectType(`AssetContributionStatementMetaDocumentOutput`)
export class AssetContributionStatementMetaDocumentOutputDTO extends IntersectionType(
  BaseAssetContributionStatementMetaDocumentOutputDTO,
  MetaDocumentDTO
) {}

@ObjectType(`AssetContributionStatementDocument`)
export class AssetContributionStatementDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => AssetContributionStatementMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: AssetContributionStatementMetaDocumentOutputDTO;
}
