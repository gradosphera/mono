import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action;

@InputType(`BaseAnnualGeneralMeetingVotingBallotMetaDocumentInput`)
class BaseAnnualGeneralMeetingVotingBallotMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@InputType(`AnnualGeneralMeetingVotingBallotGenerateDocumentInput`)
export class AnnualGeneralMeetingVotingBallotGenerateDocumentInputDTO
  extends IntersectionType(
    BaseAnnualGeneralMeetingVotingBallotMetaDocumentInputDTO,
    OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const)
  )
  implements action
{
  registry_id!: number;
}

@InputType(`AnnualGeneralMeetingVotingBallotSignedMetaDocumentInput`)
export class AnnualGeneralMeetingVotingBallotSignedMetaDocumentInputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingVotingBallotMetaDocumentInputDTO, MetaDocumentInputDTO)
  implements action {}

@InputType(`AnnualGeneralMeetingVotingBallotSignedDocumentInput`)
export class AnnualGeneralMeetingVotingBallotSignedDocumentInputDTO extends SignedDigitalDocumentInputDTO {
  @Field(() => AnnualGeneralMeetingVotingBallotSignedMetaDocumentInputDTO, {
    description: 'Метаинформация для создания протокола решения',
  })
  public readonly meta!: AnnualGeneralMeetingVotingBallotSignedMetaDocumentInputDTO;
}
