import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('GetAccountInput')
export class GetAccountInputDTO {
  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsString()
  public readonly username!: string;
}
