import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('ResetKeyInput')
export class ResetKeyInputDTO {
  @Field({ description: 'Публичный ключ для замены' })
  @IsNotEmpty({ message: 'Поле "public_key" обязательно для заполнения.' })
  public_key!: string;

  @Field({ description: 'Токен авторизации для замены ключа, полученный по email' })
  @IsNotEmpty({ message: 'Поле "token" обязательно для заполнения.' })
  token!: string;
}
