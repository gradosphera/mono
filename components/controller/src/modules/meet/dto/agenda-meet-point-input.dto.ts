import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { AgendaMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@InputType('AgendaMeetPointInput')
export class AgendaMeetPointInputDTO implements AgendaMeetPointInputDomainInterface {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  context!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  decision!: string;

  constructor(data: AgendaMeetPointInputDTO) {
    Object.assign(this, data);
  }
}
