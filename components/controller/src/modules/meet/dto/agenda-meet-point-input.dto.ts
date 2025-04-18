import { Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import type { AgendaMeetPointInputDomainInterface } from '~/domain/meet/interfaces/agenda-meet-point-input-domain.interface';

@ObjectType('AgendaMeetPoint')
export class AgendaMeetPointDTO implements AgendaMeetPointInputDomainInterface {
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

  constructor(data: AgendaMeetPointDTO) {
    Object.assign(this, data);
  }
}
