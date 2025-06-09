import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { AgendaGeneralMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@InputType('AgendaGeneralMeetPointInput', { description: 'Пункт повестки общего собрания (для ввода)' })
export class AgendaGeneralMeetPointInputDTO implements AgendaGeneralMeetPointInputDomainInterface {
  @Field(() => String, { description: 'Контекст или дополнительная информация по пункту повестки' })
  @IsNotEmpty()
  @IsString()
  context!: string;

  @Field(() => String, { description: 'Заголовок пункта повестки' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Field(() => String, { description: 'Предлагаемое решение по пункту повестки' })
  @IsNotEmpty()
  @IsString()
  decision!: string;

  constructor(data: AgendaGeneralMeetPointInputDomainInterface) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
