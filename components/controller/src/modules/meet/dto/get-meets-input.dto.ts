import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetMeetsInputDomainInterface } from '~/domain/meet/interfaces/get-meets-input-domain.interface';

@InputType('GetMeetsInput')
export class GetMeetsInputDTO implements GetMeetsInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty()
  @IsString()
  coopname!: string;

  constructor(data: GetMeetsInputDTO) {
    Object.assign(this, data);
  }
}
