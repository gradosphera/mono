import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AssetContributionAct.Action;

@InputType(`BaseAssetContributionActMetaDocumentInput`)
class BaseAssetContributionActMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  decision_id!: number;

  @Field({ description: 'Идентификатор акта' })
  @IsNotEmpty()
  act_id!: string;

  @Field({ description: 'Имя аккаунта получателя на кооперативном участке' })
  @IsNotEmpty()
  receiver!: string;

  @Field({ description: 'Имя аккаунта кооперативного участка', nullable: true })
  @IsOptional()
  braname?: string;
}

@ObjectType(`BaseAssetContributionActMetaDocumentOutput`)
class BaseAssetContributionActMetaDocumentOutputDTO {}

@InputType(`AssetContributionActGenerateDocumentInput`)
export class AssetContributionActGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAssetContributionActMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`AssetContributionActSignedMetaDocumentInput`)
export class AssetContributionActSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAssetContributionActMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AssetContributionActSignedDocumentInput`)
export class AssetContributionActSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AssetContributionActSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: AssetContributionActSignedMetaDocumentInputDTO;
}

@ObjectType(`AssetContributionActMetaDocumentOutput`)
export class AssetContributionActMetaDocumentOutputDTO extends IntersectionType(
  BaseAssetContributionActMetaDocumentOutputDTO,
  MetaDocumentDTO
) {}

@ObjectType(`AssetContributionActDocument`)
export class AssetContributionActDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => AssetContributionActMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: AssetContributionActMetaDocumentOutputDTO;
}
