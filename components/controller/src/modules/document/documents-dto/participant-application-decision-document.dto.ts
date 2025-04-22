import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SignedDigitalDocumentBase } from '~/modules/document/dto/signed-digital-document.base';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.DecisionOfParticipantApplication.Action;

@InputType(`BaseParticipantApplicationDecisionMetaDocumentInput`)
class BaseParticipantApplicationDecisionMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор протокола решения собрания совета' })
  @IsNumber()
  decision_id!: number;
}

@ObjectType(`BaseParticipantApplicationDecisionMetaDocumentOutput`)
class BaseParticipantApplicationDecisionMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
  @Field({ description: 'Идентификатор протокола решения собрания совета' })
  @IsNumber()
  decision_id!: number;
}

@InputType(`ParticipantApplicationDecisionGenerateDocumentInput`)
export class ParticipantApplicationDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseParticipantApplicationDecisionMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;

  constructor() {
    super();
  }
}

@InputType(`ParticipantApplicationDecisionSignedMetaDocumentInput`)
export class ParticipantApplicationDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseParticipantApplicationDecisionMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`ParticipantApplicationDecisionSignedDocumentInput`)
export class ParticipantApplicationDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => ParticipantApplicationDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public readonly meta!: ParticipantApplicationDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`ParticipantApplicationDecisionMetaDocumentOutput`)
export class ParticipantApplicationDecisionMetaDocumentOutputDTO
  extends IntersectionType(BaseParticipantApplicationDecisionMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`ParticipantApplicationDecisionSignedDocument`)
export class ParticipantApplicationDecisionSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => ParticipantApplicationDecisionMetaDocumentOutputDTO, {
    description: 'Метаинформация для создания проекта свободного решения',
  })
  public override readonly meta!: ParticipantApplicationDecisionMetaDocumentOutputDTO;
}

@ObjectType(`ParticipantApplicationDecisionDocument`)
export class ParticipantApplicationDecisionDocumentDTO
  extends GeneratedDocumentDTO
  implements GeneratedDocumentDomainInterface
{
  @Field(() => ParticipantApplicationDecisionMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: ParticipantApplicationDecisionMetaDocumentOutputDTO;
}

@ObjectType('ParticipantApplicationDecisionDocumentAggregate')
export class ParticipantApplicationDecisionDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<ParticipantApplicationDecisionMetaDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [ParticipantApplicationDecisionSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantApplicationDecisionSignedDocumentDTO)
  signatures!: ParticipantApplicationDecisionSignedDocumentDTO[];

  @Field(() => ParticipantApplicationDecisionDocumentDTO, { nullable: true })
  rawDocument?: ParticipantApplicationDecisionDocumentDTO;
}
