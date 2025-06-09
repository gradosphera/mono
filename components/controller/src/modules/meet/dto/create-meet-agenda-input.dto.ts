import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateAnnualGeneralMeetInputDomainInterface } from '~/domain/meet/interfaces/create-annual-meet-input-domain.interface';
import { AgendaGeneralMeetPointInputDTO } from './agenda-meet-point-input.dto';
import { AnnualGeneralMeetingAgendaSignedDocumentInputDTO } from '~/modules/document/documents-dto/annual-general-meeting-agenda-document.dto';

@InputType('CreateAnnualGeneralMeetInput')
export class CreateAnnualGeneralMeetInputDTO implements CreateAnnualGeneralMeetInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty({ message: 'Имя аккаунта кооператива не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта кооператива должно быть строкой' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта инициатора' })
  @IsNotEmpty({ message: 'Имя аккаунта инициатора не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта инициатора должно быть строкой' })
  initiator!: string;

  @Field(() => String, { description: 'Имя аккаунта председателя' })
  @IsNotEmpty({ message: 'Имя аккаунта председателя не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта председателя должно быть строкой' })
  presider!: string;

  @Field(() => String, { description: 'Имя аккаунта секретаря' })
  @IsNotEmpty({ message: 'Имя аккаунта секретаря не должно быть пустым' })
  @IsString({ message: 'Имя аккаунта секретаря должно быть строкой' })
  secretary!: string;

  @Field(() => [AgendaGeneralMeetPointInputDTO], { description: 'Повестка собрания' })
  @IsArray({ message: 'Повестка должна быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => AgendaGeneralMeetPointInputDTO)
  agenda!: AgendaGeneralMeetPointInputDTO[];

  @Field(() => Date, { description: 'Время открытия собрания' })
  @IsNotEmpty({ message: 'Время открытия собрания не должно быть пустым' })
  open_at!: Date;

  @Field(() => Date, { description: 'Время закрытия собрания' })
  @IsNotEmpty({ message: 'Время закрытия собрания не должно быть пустым' })
  close_at!: Date;

  @Field(() => AnnualGeneralMeetingAgendaSignedDocumentInputDTO, { description: 'Предложение повестки собрания' })
  proposal!: AnnualGeneralMeetingAgendaSignedDocumentInputDTO;
}
