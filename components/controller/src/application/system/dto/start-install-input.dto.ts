import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType('StartInstallInput')
export class StartInstallInputDTO {
  @Field(() => String, { description: 'Приватный ключ кооператива' })
  @IsNotEmpty({ message: 'Поле "wif" обязательно для заполнения.' })
  @IsString()
  wif!: string;
}
