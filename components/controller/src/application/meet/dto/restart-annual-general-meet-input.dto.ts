import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnualGeneralMeetingAgendaSignedDocumentInputDTO } from '~/application/document/documents-dto/annual-general-meeting-agenda-document.dto';
import { RestartAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/restart-annual-general-meet-input-domain.interface';

@InputType('RestartAnnualGeneralMeetInput', { description: 'DTO для перезапуска ежегодного общего собрания кооператива' })
export class RestartAnnualGeneralMeetInputDTO implements RestartAnnualGeneralMeetInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш собрания, которое необходимо перезапустить' })
  @IsString()
  hash!: string;

  @Field(() => AnnualGeneralMeetingAgendaSignedDocumentInputDTO, {
    description: 'Новое предложение повестки ежегодного общего собрания',
  })
  @ValidateNested()
  newproposal!: AnnualGeneralMeetingAgendaSignedDocumentInputDTO;

  @Field(() => Date, { description: 'Новая дата открытия собрания' })
  @IsDate()
  @Type(() => Date)
  new_open_at!: Date;

  @Field(() => Date, { description: 'Новая дата закрытия собрания' })
  @IsDate()
  @Type(() => Date)
  new_close_at!: Date;
}
