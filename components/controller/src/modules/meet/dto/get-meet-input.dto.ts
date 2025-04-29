import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetMeetInputDomainInterface } from '~/domain/meet/interfaces/get-meet-input-domain.interface';

@InputType('GetMeetInput')
export class GetMeetInputDTO implements GetMeetInputDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsNotEmpty()
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хеш собрания' })
  @IsNotEmpty()
  @IsString()
  hash!: string;

  constructor(data: GetMeetInputDTO) {
    Object.assign(this, data);
  }
}
