import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsNumberString } from 'class-validator';

@InputType('UpdateRequestInput')
export class UpdateRequestInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор обмена' })
  @IsNumberString()
  exchange_id!: string;

  @Field(() => String, { description: 'Оставшееся количество единиц' })
  @IsNumberString()
  remain_units!: string;

  @Field(() => String, { description: 'Стоимость за единицу' })
  @IsString()
  unit_cost!: string;

  @Field(() => String, { description: 'Дополнительные данные' })
  @IsString()
  data!: string;

  @Field(() => String, { description: 'Дополнительная информация' })
  @IsString()
  meta!: string;
}
