import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingNotification.Action;

@InputType(`BaseAnnualGeneralMeetingNotificationDocumentInput`)
class BaseAnnualGeneralMeetingNotificationDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}
@InputType(`AnnualGeneralMeetingNotificationGenerateDocumentInput`)
export class AnnualGeneralMeetingNotificationGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAnnualGeneralMeetingNotificationDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`AnnualGeneralMeetingNotificationSignedMetaDocumentInput`)
export class AnnualGeneralMeetingNotificationSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingNotificationDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AnnualGeneralMeetingNotificationSignedDocumentInput`)
export class AnnualGeneralMeetingNotificationSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AnnualGeneralMeetingNotificationSignedMetaDocumentInputDTO, {
    description: 'Метаинформация',
  })
  public readonly meta!: AnnualGeneralMeetingNotificationSignedMetaDocumentInputDTO;
}
