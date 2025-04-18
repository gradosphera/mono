import { InputType, Field, ObjectType, IntersectionType, OmitType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Cooperative } from 'cooptypes';
import type { GeneratedDocumentDomainInterface } from '~/domain/document/interfaces/generated-document-domain.interface';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import { SignedDigitalDocumentBase } from '~/modules/document/dto/signed-digital-document.base';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingSovietDecision.Action;

@InputType(`BaseAnnualGeneralMeetingSovietDecisionDocumentInput`)
class BaseAnnualGeneralMeetingSovietDecisionDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@ObjectType(`BaseAnnualGeneralMeetingSovietDecisionDocumentOutput`)
class BaseAnnualGeneralMeetingSovietDecisionDocumentOutputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@InputType(`AnnualGeneralMeetingSovietDecisionGenerateDocumentInput`)
export class AnnualGeneralMeetingSovietDecisionGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAnnualGeneralMeetingSovietDecisionDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`AnnualGeneralMeetingSovietDecisionSignedMetaDocumentInput`)
export class AnnualGeneralMeetingSovietDecisionSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingSovietDecisionDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AnnualGeneralMeetingSovietDecisionSignedDocumentInput`)
export class AnnualGeneralMeetingSovietDecisionSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AnnualGeneralMeetingSovietDecisionSignedMetaDocumentInputDTO, {
    description: 'Метаинформация',
  })
  public readonly meta!: AnnualGeneralMeetingSovietDecisionSignedMetaDocumentInputDTO;
}

@ObjectType(`AnnualGeneralMeetingSovietDecisionDocumentOutput`)
export class AnnualGeneralMeetingSovietDecisionDocumentOutputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingSovietDecisionDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`AnnualGeneralMeetingSovietDecisionSignedDocument`)
export class AnnualGeneralMeetingSovietDecisionSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => AnnualGeneralMeetingSovietDecisionDocumentOutputDTO, {
    description: 'Метаинформация',
  })
  public override readonly meta!: AnnualGeneralMeetingSovietDecisionDocumentOutputDTO;
}

@ObjectType(`AnnualGeneralMeetingSovietDecisionDocument`)
export class AnnualGeneralMeetingSovietDecisionDocumentDTO
  extends GeneratedDocumentDTO
  implements GeneratedDocumentDomainInterface
{
  @Field(() => AnnualGeneralMeetingSovietDecisionDocumentOutputDTO, {
    description: `Метаинформация`,
  })
  @ValidateNested()
  public readonly meta!: AnnualGeneralMeetingSovietDecisionDocumentOutputDTO;
}
