import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
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
type action = Cooperative.Registry.AnnualGeneralMeetingDecision.Action;

@InputType(`BaseAnnualGeneralMeetingDecisionDocumentInput`)
class BaseAnnualGeneralMeetingDecisionDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@ObjectType(`BaseAnnualGeneralMeetingDecisionDocumentOutput`)
class BaseAnnualGeneralMeetingDecisionDocumentOutputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@InputType(`AnnualGeneralMeetingDecisionGenerateDocumentInput`)
export class AnnualGeneralMeetingDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAnnualGeneralMeetingDecisionDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`AnnualGeneralMeetingDecisionSignedMetaDocumentInput`)
export class AnnualGeneralMeetingDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingDecisionDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AnnualGeneralMeetingDecisionSignedDocumentInput`)
export class AnnualGeneralMeetingDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AnnualGeneralMeetingDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация',
  })
  public readonly meta!: AnnualGeneralMeetingDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`AnnualGeneralMeetingDecisionDocumentOutput`)
export class AnnualGeneralMeetingDecisionDocumentOutputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingDecisionDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`AnnualGeneralMeetingDecisionSignedDocument`)
export class AnnualGeneralMeetingDecisionSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => AnnualGeneralMeetingDecisionDocumentOutputDTO, {
    description: 'Метаинформация',
  })
  public override readonly meta!: AnnualGeneralMeetingDecisionDocumentOutputDTO;
}

@ObjectType(`AnnualGeneralMeetingDecisionDocument`)
export class AnnualGeneralMeetingDecisionDocumentDTO
  extends GeneratedDocumentDTO
  implements GeneratedDocumentDomainInterface
{
  @Field(() => AnnualGeneralMeetingDecisionDocumentOutputDTO, {
    description: `Метаинформация`,
  })
  @ValidateNested()
  public readonly meta!: AnnualGeneralMeetingDecisionDocumentOutputDTO;
}

@ObjectType('AnnualGeneralMeetingDecisionDocumentAggregate')
export class AnnualGeneralMeetingDecisionDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<AnnualGeneralMeetingDecisionDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [AnnualGeneralMeetingDecisionSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnnualGeneralMeetingDecisionSignedDocumentDTO)
  signatures!: AnnualGeneralMeetingDecisionSignedDocumentDTO[];

  @Field(() => AnnualGeneralMeetingDecisionDocumentDTO, { nullable: true })
  rawDocument?: AnnualGeneralMeetingDecisionDocumentDTO;
}
