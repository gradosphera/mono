import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { ValidateNested, IsNotEmpty, IsNumber } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.ReturnByAssetDecision.Action;

@InputType(`BaseReturnByAssetDecisionMetaDocumentInput`)
class BaseReturnByAssetDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  @IsNumber()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  @IsNumber()
  decision_id!: number;
}

@ObjectType(`BaseReturnByAssetDecisionMetaDocumentOutput`)
class BaseReturnByAssetDecisionMetaDocumentOutputDTO {
  @Field({ description: 'Идентификатор заявки' })
  @IsNotEmpty()
  @IsNumber()
  request_id!: number;

  @Field({ description: 'Идентификатор решения' })
  @IsNotEmpty()
  @IsNumber()
  decision_id!: number;
}

@InputType(`ReturnByAssetDecisionGenerateDocumentInput`)
export class ReturnByAssetDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseReturnByAssetDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`ReturnByAssetDecisionSignedMetaDocumentInput`)
export class ReturnByAssetDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseReturnByAssetDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ReturnByAssetDecisionSignedDocumentInput`)
export class ReturnByAssetDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ReturnByAssetDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ReturnByAssetDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`ReturnByAssetDecisionMetaDocumentOutput`)
export class ReturnByAssetDecisionMetaDocumentOutputDTO extends IntersectionType(
  BaseReturnByAssetDecisionMetaDocumentOutputDTO,
  MetaDocumentDTO
) {}

@ObjectType(`ReturnByAssetDecisionDocument`)
export class ReturnByAssetDecisionDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => ReturnByAssetDecisionMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ReturnByAssetDecisionMetaDocumentOutputDTO;
}
