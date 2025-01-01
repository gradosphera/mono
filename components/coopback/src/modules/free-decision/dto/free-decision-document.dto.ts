import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.FreeDecision.Action;

@InputType(`BaseFreeDecisionMetaDocumentInput`)
class BaseFreeDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор протокола решения собрания совета' })
  @IsString()
  decision_id!: number;

  @Field({ description: 'Идентификатор проекта решения' })
  @IsString()
  project_id!: string;
}

@ObjectType(`BaseFreeDecisionMetaDocumentOutput`)
class BaseFreeDecisionMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор повестки дня' })
  @IsString()
  decision_id!: number;

  @Field({ description: 'Идентификатор протокола решения собрания совета' })
  @IsString()
  project_id!: string;
}

@InputType(`FreeDecisionGenerateDocumentInput`)
export class FreeDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseFreeDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`FreeDecisionSignedMetaDocumentInput`)
export class FreeDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseFreeDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`FreeDecisionSignedDocumentInput`)
export class FreeDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => FreeDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания протокола решения',
  })
  public readonly meta!: FreeDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`FreeDecisionMetaDocumentOutput`)
export class FreeDecisionMetaDocumentOutputDTO
  extends IntersectionType(BaseFreeDecisionMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`FreeDecisionDocument`)
export class FreeDecisionDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => FreeDecisionMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: FreeDecisionMetaDocumentOutputDTO;
}
