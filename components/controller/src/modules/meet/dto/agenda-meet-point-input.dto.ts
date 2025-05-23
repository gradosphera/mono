import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { AgendaMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@InputType('AgendaMeetPointInput', { description: 'Пункт повестки собрания (для ввода)' })
export class AgendaMeetPointInputDTO implements AgendaMeetPointInputDomainInterface {
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

  constructor(data: AgendaMeetPointInputDomainInterface) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
