import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('StartResetKeyInput')
export class StartResetKeyInputDTO {
  @Field({ description: 'Электронная почта' })
  @IsNotEmpty({ message: 'Поле "email" обязательно для заполнения.' })
  email!: string;
}
