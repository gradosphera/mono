import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('DeleteAccountInput')
export class DeleteAccountInputDTO {
  @Field({ description: 'Имя аккаунта пользователя' })
  @IsNotEmpty({ message: 'Поле "username_for_delete" обязательно для заполнения.' })
  username_for_delete!: string;
}
