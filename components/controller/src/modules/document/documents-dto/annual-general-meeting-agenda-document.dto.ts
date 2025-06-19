import { InputType, Field, IntersectionType, OmitType } from '@nestjs/graphql';
import { Cooperative } from 'cooptypes';
import { GenerateMetaDocumentInputDTO } from '~/modules/document/dto/generate-meta-document-input.dto';
import { MetaDocumentInputDTO } from '~/modules/document/dto/meta-document-input.dto';
import { SignedDigitalDocumentInputDTO } from '~/modules/document/dto/signed-digital-document-input.dto';
import type { ExcludeCommonProps } from '~/modules/document/types';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { AgendaMeetDTO } from '~/modules/meet/dto/agenda-meet.dto';
import { AgendaGeneralMeetQuestionDTO } from '~/modules/meet/dto/agenda-general-meet-question.dto';

// интерфейс параметров для генерации
type action = Cooperative.Registry.AnnualGeneralMeetingAgenda.Action;

@InputType(`BaseAnnualGeneralMeetingAgendaMetaDocumentInput`)
class BaseAnnualGeneralMeetingAgendaMetaDocumentInputDTO implements ExcludeCommonProps<action> {
  @Field(() => AgendaMeetDTO)
  @IsObject()
  @ValidateNested()
  @Type(() => AgendaMeetDTO)
  meet!: AgendaMeetDTO;

  @Field(() => [AgendaGeneralMeetQuestionDTO])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgendaGeneralMeetQuestionDTO)
  questions!: AgendaGeneralMeetQuestionDTO[];

  @Field(() => Boolean, { description: 'Флаг повторного собрания' })
  @IsBoolean()
  @IsNotEmpty()
  is_repeated!: boolean;
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
