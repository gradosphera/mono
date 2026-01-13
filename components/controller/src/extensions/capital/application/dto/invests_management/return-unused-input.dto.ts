import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

/**
 * DTO для возврата неиспользованных инвестиций
 */
@InputType('ReturnUnusedInput')
export class ReturnUnusedInputDTO {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  coopname!: string;

  @Field(() => String, { description: 'Хэш проекта' })
  @IsString()
  project_hash!: string;

  @Field(() => String, { description: 'Имя инвестора' })
  @IsString()
  username!: string;
}
