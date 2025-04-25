import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingAgenda.Action;

@InputType(`BaseAnnualGeneralMeetingAgendaMetaDocumentInput`)
class BaseAnnualGeneralMeetingAgendaMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@InputType(`AnnualGeneralMeetingAgendaGenerateDocumentInput`)
export class AnnualGeneralMeetingAgendaGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAnnualGeneralMeetingAgendaMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`AnnualGeneralMeetingAgendaSignedMetaDocumentInput`)
export class AnnualGeneralMeetingAgendaSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingAgendaMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AnnualGeneralMeetingAgendaSignedDocumentInput`)
export class AnnualGeneralMeetingAgendaSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AnnualGeneralMeetingAgendaSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания протокола решения',
  })
  public readonly meta!: AnnualGeneralMeetingAgendaSignedMetaDocumentInputDTO;
}
