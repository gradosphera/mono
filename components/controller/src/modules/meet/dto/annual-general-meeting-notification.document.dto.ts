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
type action = Cooperative.Registry.AnnualGeneralMeetingNotification.Action;

@InputType(`BaseAnnualGeneralMeetingNotificationDocumentInput`)
class BaseAnnualGeneralMeetingNotificationDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@ObjectType(`BaseAnnualGeneralMeetingNotificationDocumentOutput`)
class BaseAnnualGeneralMeetingNotificationDocumentOutputDTO implements ExcludeCommonProps<action> {
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

@ObjectType(`AnnualGeneralMeetingNotificationDocumentOutput`)
export class AnnualGeneralMeetingNotificationDocumentOutputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingNotificationDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`AnnualGeneralMeetingNotificationSignedDocument`)
export class AnnualGeneralMeetingNotificationSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => AnnualGeneralMeetingNotificationDocumentOutputDTO, {
    description: 'Метаинформация',
  })
  public override readonly meta!: AnnualGeneralMeetingNotificationDocumentOutputDTO;
}

@ObjectType(`AnnualGeneralMeetingNotificationDocument`)
export class AnnualGeneralMeetingNotificationDocumentDTO
  extends GeneratedDocumentDTO
  implements GeneratedDocumentDomainInterface
{
  @Field(() => AnnualGeneralMeetingNotificationDocumentOutputDTO, {
    description: `Метаинформация`,
  })
  @ValidateNested()
  public readonly meta!: AnnualGeneralMeetingNotificationDocumentOutputDTO;
}
