import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для получения по запросу.
 */
@InputType('ReceiveOnRequestInput')
export class ReceiveOnRequestInputDTO {
  @Field({ description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname: string;

  @Field({ description: 'Имя аккаунта пользователя' })
  @IsString()
  username: string;

  @Field({ description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id: string;

  @Field({ description: 'Документ подтверждения получения' })
  @ValidateNested()
  @Type(() => Object)
  document: any;
}
