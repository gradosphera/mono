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
type action = Cooperative.Registry.AnnualGeneralMeetingAgenda.Action;

@InputType(`BaseAnnualGeneralMeetingAgendaMetaDocumentInput`)
class BaseAnnualGeneralMeetingAgendaMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  // Мета пока не содержит дополнительных полей
}

@ObjectType(`BaseAnnualGeneralMeetingAgendaMetaDocumentOutput`)
class BaseAnnualGeneralMeetingAgendaMetaDocumentOutputDTO implements ExcludeCommonProps<action> {
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

@ObjectType(`AnnualGeneralMeetingAgendaMetaDocumentOutput`)
export class AnnualGeneralMeetingAgendaMetaDocumentOutputDTO
  extends IntersectionType(BaseAnnualGeneralMeetingAgendaMetaDocumentOutputDTO, MetaDocumentDTO)
  implements action {}

@ObjectType(`AnnualGeneralMeetingAgendaSignedDocument`)
export class AnnualGeneralMeetingAgendaSignedDocumentDTO extends SignedDigitalDocumentBase {
  @Field(() => AnnualGeneralMeetingAgendaMetaDocumentOutputDTO, {
    description: 'Метаинформация для создания повестки общего собрания',
  })
  public override readonly meta!: AnnualGeneralMeetingAgendaMetaDocumentOutputDTO;
}

@ObjectType(`AnnualGeneralMeetingAgendaDocument`)
export class AnnualGeneralMeetingAgendaDocumentDTO extends GeneratedDocumentDTO implements GeneratedDocumentDomainInterface {
  @Field(() => AnnualGeneralMeetingAgendaMetaDocumentOutputDTO, {
    description: `Метаинформация для создания повестки общего собрания`,
  })
  @ValidateNested()
  public readonly meta!: AnnualGeneralMeetingAgendaMetaDocumentOutputDTO;
}

@ObjectType('AnnualGeneralMeetingAgendaDocumentAggregate')
export class AnnualGeneralMeetingAgendaDocumentAggregateDTO
  implements DocumentAggregateDomainInterface<AnnualGeneralMeetingAgendaMetaDocumentOutputDTO>
{
  @Field(() => String)
  hash!: string;

  @Field(() => [AnnualGeneralMeetingAgendaSignedDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnnualGeneralMeetingAgendaSignedDocumentDTO)
  signatures!: AnnualGeneralMeetingAgendaSignedDocumentDTO[];

  @Field(() => AnnualGeneralMeetingAgendaDocumentDTO, { nullable: true })
  rawDocument?: AnnualGeneralMeetingAgendaDocumentDTO;
}
