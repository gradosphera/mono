import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class VerifyEmailInputDTO {
  @Field(() => String, { description: 'Токен верификации email' })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
