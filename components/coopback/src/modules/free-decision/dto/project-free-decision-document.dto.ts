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
type action = Cooperative.Registry.ProjectFreeDecision.Action;

// идентификатор шаблона в реестре документов
const registry_id = Cooperative.Registry.ProjectFreeDecision.registry_id;

@InputType(`BaseProjectFreeDecisionMetaDocumentInput`)
class BaseProjectFreeDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор проекта решения' })
  @IsString()
  project_id!: string;
}

@ObjectType(`BaseProjectFreeDecisionMetaDocumentOutput`)
class BaseProjectFreeDecisionMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор проекта решения' })
  @IsString()
  project_id!: string;
}

@InputType(`ProjectFreeDecisionGenerateDocumentInput`)
export class ProjectFreeDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseProjectFreeDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id: number;

  constructor() {
    super();
    this.registry_id = registry_id;
  }
}

@InputType(`ProjectFreeDecisionSignedMetaDocumentInput`)
export class ProjectFreeDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseProjectFreeDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ProjectFreeDecisionSignedDocumentInput`)
export class ProjectFreeDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ProjectFreeDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ProjectFreeDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`ProjectFreeDecisionMetaDocumentOutput`)
export class ProjectFreeDecisionMetaDocumentOutputDTO
  extends IntersectionType(BaseProjectFreeDecisionMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`ProjectFreeDecisionDocument`)
export class ProjectFreeDecisionDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => ProjectFreeDecisionMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ProjectFreeDecisionMetaDocumentOutputDTO;
}
