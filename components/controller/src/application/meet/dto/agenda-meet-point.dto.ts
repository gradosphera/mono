import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { AgendaGeneralMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@ObjectType('AgendaMeetPoint', { description: 'Пункт повестки собрания' })
export class AgendaMeetPointDTO implements AgendaGeneralMeetPointInputDomainInterface {
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
