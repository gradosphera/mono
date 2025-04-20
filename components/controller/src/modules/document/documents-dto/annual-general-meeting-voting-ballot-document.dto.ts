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
type action = Cooperative.Registry.AnnualGeneralMeetingVotingBallot.Action;

@InputType(`BaseAnnualGeneralMeetingVotingBallotMetaDocumentInput`)
class BaseAnnualGeneralMeetingVotingBallotMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@ObjectType(`BaseAnnualGeneralMeetingVotingBallotMetaDocumentOutput`)
class BaseAnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
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

@ObjectType(`AnnualGeneralMeetingVotingBallotMetaDocumentOutput`)
export class AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`AnnualGeneralMeetingVotingBallotSignedDocument`)
export class AnnualGeneralMeetingVotingBallotSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO, {
    description: 'Метаинформация для создания протокола решения',
  })
  public override readonly meta!: AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO;
}

@ObjectType(`AnnualGeneralMeetingVotingBallotDocument`)
export class AnnualGeneralMeetingVotingBallotDocumentDTO
  extends GeneratedDocumentDTO
  implements GeneratedDocumentDomainInterface
{
  @Field(() => AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO, {
    description: `Метаинформация для создания проекта свободного решения`,
  })
  @ValidateNested()
  public readonly meta!: AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO;
}

@ObjectType('AnnualGeneralMeetingVotingBallotDocumentAggregate')
export class AnnualGeneralMeetingVotingBallotDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<AnnualGeneralMeetingVotingBallotMetaDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [AnnualGeneralMeetingVotingBallotSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnnualGeneralMeetingVotingBallotSignedDocumentDTO)
  signatures!: AnnualGeneralMeetingVotingBallotSignedDocumentDTO[];

  @Field(() => AnnualGeneralMeetingVotingBallotDocumentDTO, { nullable: true })
  rawDocument?: AnnualGeneralMeetingVotingBallotDocumentDTO;
}
