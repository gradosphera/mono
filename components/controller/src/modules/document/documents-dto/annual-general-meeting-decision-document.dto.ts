import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingDecision.Action;

@InputType(`BaseAnnualGeneralMeetingDecisionDocumentInput`)
class BaseAnnualGeneralMeetingDecisionDocumentInputDTO implements ExcludeCommonProps<action> {
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
