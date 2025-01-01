import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('LoginInput')
export class LoginInputDTO {
  @Field({ description: 'Электронная почта' })
  @IsNotEmpty({ message: 'Поле "email" обязательно для заполнения.' })
  email!: string;

  @Field({ description: 'Метка времени в строковом формате ISO' })
  @IsNotEmpty({ message: 'Поле "now" обязательно для заполнения.' })
  now!: string;

  @Field({ description: 'Цифровая подпись метки времени' })
  @IsNotEmpty({ message: 'Поле "signature" обязательно для заполнения.' })
  signature!: string;
}
