import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';
import { IsNotEmpty, IsString } from 'class-validator';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action;

@InputType(`BaseAnnualGeneralMeetingVotingBallotMetaDocumentInput`)
class BaseAnnualGeneralMeetingVotingBallotMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field(() => String, { description: 'Хеш собрания' })
  @IsString()
  @IsNotEmpty()
  meet_hash!: string;

  @Field(() => String, { description: 'Имя пользователя голосующего' })
  @IsString()
  @IsNotEmpty()
  username!: string;
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
  @Field(() => String, { description: 'Хеш собрания' })
  @IsString()
  @IsNotEmpty()
  meet_hash!: string;

  @Field(() => String, { description: 'Имя пользователя голосующего' })
  @IsString()
  @IsNotEmpty()
  username!: string;
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
